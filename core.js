import { EventEmitter } from 'node:events'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import crypto from 'node:crypto'
import Corestore from 'corestore'
import Hyperswarm from 'hyperswarm'
import Protomux from 'protomux'
import c from 'compact-encoding'
import b4a from 'b4a'
import { isValidMessage } from './views.js'
import { createNickname, assignColor, getTimestamp, slug } from './utils.js'

const PROTOCOL = 'datmouth/keys/v1'
const keysEncoding = c.array(c.fixed32)

export default async function createDATMouth (topicName, opts = {}) {
  const topic = slug(topicName)
  const topicKey = crypto.createHash('sha256').update(topic).digest()
  const storage = opts.storage || fs.mkdtempSync(path.join(os.tmpdir(), 'datmouth-'))

  const store = new Corestore(storage)
  const writer = store.get({ name: 'writer-' + topic, valueEncoding: 'json' })
  await writer.ready()

  const events = new EventEmitter()
  const cores = new Map()
  const channels = new Set()

  /* ASSIGN NICKNAME */
  const head = writer.length > 0 ? await writer.get(writer.length - 1) : {}
  let nickname = (head && head.nickname) || createNickname()
  let color = (head && head.color) || assignColor()

  /* TRACK TIME OF NEWER CONNECTIONS */
  let timeOfLastConnection = Date.now()

  await track(writer)

  async function track (core) {
    const id = b4a.toString(core.key, 'hex')
    if (cores.has(id)) return
    const entry = { core, seen: core.length }
    cores.set(id, entry)
    await core.ready()
    if (!core.writable) {
      entry.seen = 0
      core.download({ start: 0, end: -1 })
    }
    core.on('append', () => drain(entry))
    drain(entry)
  }

  async function drain (entry) {
    if (entry.draining) return
    entry.draining = true
    try {
      while (entry.seen < entry.core.length) {
        const seq = entry.seen++
        const value = await entry.core.get(seq)
        if (isValidMessage(value)) events.emit('message', { value })
      }
    } catch (err) {
      if (!entry.core.closed) events.emit('warning', err)
    } finally {
      entry.draining = false
    }
  }

  function knownKeys () {
    return [...cores.values()].map(({ core }) => core.key)
  }

  async function addKeys (keys) {
    const fresh = keys.filter(k => !cores.has(b4a.toString(k, 'hex')))
    if (!fresh.length) return
    await Promise.all(fresh.map(key => track(store.get({ key, valueEncoding: 'json' }))))
    for (const ch of channels) ch.messages[0].send(fresh)
  }

  function attach (streamOrInitiator) {
    const replicated = store.replicate(streamOrInitiator)
    const mux = Protomux.from(replicated.noiseStream)
    const channel = mux.createChannel({
      protocol: PROTOCOL,
      id: topicKey,
      onopen () { channel.messages[0].send(knownKeys()) },
      onclose () { channels.delete(channel) }
    })
    if (!channel) return replicated
    channel.addMessage({ encoding: keysEncoding, onmessage: keys => addKeys(keys).catch(err => events.emit('warning', err)) })
    channels.add(channel)
    channel.open()
    return replicated
  }

  /* JOIN SWARM AND DISCOVER PEERS */
  let swarm = null
  if (opts.swarm !== false) {
    swarm = new Hyperswarm(opts.swarmOpts || {})
    swarm.on('connection', (conn, info) => {
      timeOfLastConnection = Date.now()
      const local = isPrivateAddress(conn.rawStream && conn.rawStream.remoteHost)
      events.emit('peer-add', { local })
      conn.on('error', () => {})
      conn.on('close', () => events.emit('peer-remove', { local }))
      attach(conn)
    })
    swarm.join(topicKey)
  }

  return {
    publish: async (text) => {
      const msg = { type: 'chat', nickname, text, color, timestamp: getTimestamp() }
      await writer.append(msg)
      return msg
    },
    updateNickname: (newNickname) => { nickname = newNickname },
    getNickname: () => nickname,
    readLast: (size) => readLast(size, cores),
    listenTail: (fn) => events.on('message', fn),
    onPeer: (fn) => {
      events.on('peer-add', info => fn('add', info))
      events.on('peer-remove', info => fn('remove', info))
    },
    onWarning: (fn) => events.on('warning', fn),
    getTimeOfLastConnection: () => timeOfLastConnection,
    setColor: (code) => { color = code },
    getColor: () => color,
    getActiveConnections: () => swarm ? swarm.connections.size : channels.size,
    getWriterKey: () => writer.key,
    attach,
    storage,
    disconnect: async () => {
      if (swarm) await swarm.destroy()
      await store.close()
    }
  }
}

async function readLast (size, cores) {
  const all = []
  for (const { core } of cores.values()) {
    for (let i = 0; i < core.length; i++) {
      const value = await core.get(i, { wait: false })
      if (isValidMessage(value)) all.push({ value })
    }
  }
  all.sort((a, b) => a.value.timestamp.localeCompare(b.value.timestamp))
  const n = Number(size)
  return n > 0 ? all.slice(-n) : all
}

function isPrivateAddress (host = '') {
  return /^(10\.|127\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|::1|f[cd]|fe80)/i.test(host)
}

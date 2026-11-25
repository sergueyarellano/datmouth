import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import createDATMouth from '../core.js'

export function tmpDir () {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'datmouth-test-'))
}

export async function tmpPeer (topic) {
  const storage = tmpDir()
  const peer = await createDATMouth(topic, { storage, swarm: false })
  const disconnect = peer.disconnect
  peer.disconnect = async () => {
    await disconnect()
    fs.rmSync(storage, { recursive: true, force: true })
  }
  return peer
}

export function connect (a, b) {
  const s1 = a.attach(true)
  const s2 = b.attach(false)
  s1.pipe(s2).pipe(s1)
  return () => { s1.destroy(); s2.destroy() }
}

export function waitFor (peer, predicate, ms = 5000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timed out')), ms)
    peer.listenTail((tail) => {
      if (predicate(tail)) { clearTimeout(timer); resolve(tail) }
    })
  })
}

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

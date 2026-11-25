import test from 'node:test'
import assert from 'node:assert/strict'
import createTestnet from 'hyperdht/testnet.js'
import DHT from 'hyperdht'
import createDATMouth from '../core.js'
import { tmpPeer, tmpDir, connect, waitFor, sleep } from './helpers.js'

test('publish appends a message to the feed', async (t) => {
  const datmouth = await tmpPeer('test')
  t.after(() => datmouth.disconnect())
  const published = await datmouth.publish('example message')

  assert.deepEqual(Object.keys(published), ['type', 'nickname', 'text', 'color', 'timestamp'])
  assert.equal(published.text, 'example message')
  assert.equal(published.type, 'chat')
  assert.match(published.timestamp, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
})

test('readLast', async (t) => {
  const datmouth = await tmpPeer('test2')
  t.after(() => datmouth.disconnect())
  const msgs = ['first message', 'second message', 'third message']
  for (const m of msgs) {
    await datmouth.publish(m)
    await sleep(5)
  }

  const texts = (entries) => entries.map(e => e.value.text)
  assert.deepEqual(texts(await datmouth.readLast(1)), [msgs[2]], 'should read last message')
  assert.deepEqual(texts(await datmouth.readLast(2)), msgs.slice(1), 'should read last 2 messages')
  assert.deepEqual(texts(await datmouth.readLast()), msgs, 'should read all messages')
})

test('listenTail receives own messages', async (t) => {
  const datmouth = await tmpPeer('test3')
  t.after(() => datmouth.disconnect())
  const received = waitFor(datmouth, () => true)
  await datmouth.publish('a simple message')
  assert.equal((await received).value.text, 'a simple message')
})

test('updateNickname is used for new messages', async (t) => {
  const datmouth = await tmpPeer('test4')
  t.after(() => datmouth.disconnect())
  datmouth.updateNickname('dude')
  const msg = await datmouth.publish('hi')
  assert.equal(msg.nickname, 'dude')
})

test('two peers replicate each other\'s messages', async (t) => {
  const a = await tmpPeer('room')
  const b = await tmpPeer('room')
  t.after(async () => { close(); await a.disconnect(); await b.disconnect() })

  await a.publish('written before connecting')
  const close = connect(a, b)

  const backlog = await waitFor(b, tail => tail.value.text === 'written before connecting')
  assert.equal(backlog.value.text, 'written before connecting')

  const live = waitFor(a, tail => tail.value.text === 'hello from b')
  await b.publish('hello from b')
  assert.equal((await live).value.text, 'hello from b')

  const history = (await b.readLast()).map(e => e.value.text)
  assert.deepEqual(history, ['written before connecting', 'hello from b'])
})

test('writer keys are gossiped through a shared peer', async (t) => {
  const [a, b, c] = await Promise.all([tmpPeer('mesh'), tmpPeer('mesh'), tmpPeer('mesh')])
  const closeAB = connect(a, b)
  const closeBC = connect(b, c)
  t.after(async () => {
    closeAB(); closeBC()
    await Promise.all([a.disconnect(), b.disconnect(), c.disconnect()])
  })

  const got = waitFor(c, tail => tail.value.text === 'from a')
  await a.publish('from a')
  assert.equal((await got).value.text, 'from a')
})

test('two peers find each other over hyperswarm and chat', async (t) => {
  const testnet = await createTestnet(3)
  const topic = 'swarm-' + process.pid
  const dhts = [0, 1].map(() => new DHT({ bootstrap: testnet.bootstrap, host: '127.0.0.1' }))
  const a = await createDATMouth(topic, { storage: tmpDir(), swarmOpts: { dht: dhts[0] } })
  const b = await createDATMouth(topic, { storage: tmpDir(), swarmOpts: { dht: dhts[1] } })
  t.after(async () => {
    await a.disconnect(); await b.disconnect()
    await Promise.all(dhts.map(d => d.destroy()))
    await testnet.destroy()
  })

  const connected = new Promise(resolve => a.onPeer(change => change === 'add' && resolve()))
  await connected
  const got = waitFor(a, tail => tail.value.text === 'over the swarm')
  await b.publish('over the swarm')
  assert.equal((await got).value.text, 'over the swarm')
  assert.equal(a.getActiveConnections(), 1)
})

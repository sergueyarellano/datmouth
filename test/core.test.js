const test = require('tape')
const core = require('../core')
const ram = require('random-access-memory')

/*
  Kind of testing third parties here (kappa core, kappa view list),
  but I wanted to have something to test from consumer perspective of this core
*/

test('publish appends a message to the feed', async function (t) {
  t.plan(4)
  const datmouth = await core('test', ram)
  datmouth.disconnect()
  const msg = 'example message'
  const published = await datmouth.publish(msg)
  {
    const actual = Object.keys(published)
    const expected = ['type', 'nickname', 'text', 'color', 'timestamp']
    t.deepEqual(actual, expected)
  }

  {
    const actual = published.text
    const expected = msg
    t.deepEqual(actual, expected)
  }
  {
    const actual = published.type
    const expected = 'chat'
    t.deepEqual(actual, expected)
  }
  {
    const re = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
    const actual = re.test(published.timestamp)
    const expected = true
    t.deepEqual(actual, expected)
  }
})

test('readLast', async t => {
  t.plan(6)
  const datmouth = await core('test2', ram)
  datmouth.disconnect()
  const msg = 'first message'
  const msg2 = 'second message'
  const msg3 = 'third message'
  await datmouth.publish(msg)
  await sleep(200) // otherwise I noticed race conditions can occur on append to hypercore
  await datmouth.publish(msg2)
  await sleep(200)
  await datmouth.publish(msg3)

  {
    const actual = await datmouth.readLast(1)
    const expected = msg3
    t.deepEqual(actual[0].value.text, expected, 'should read last message')
  }
  {
    const entries = await datmouth.readLast(2)
    const expected = [msg2, msg3]
    entries.forEach((entry, index) => {
      t.deepEqual(entry.value.text, expected[index], 'should read last 2 messages')
    })
  }
  {
    const entries = await datmouth.readLast()
    const expected = [msg, msg2, msg3]
    entries.forEach((entry, index) => {
      t.deepEqual(entry.value.text, expected[index], 'should read all messages')
    })
  }
})

test('listenTail', async t => {
  t.plan(1)
  const msg = 'a simple message'
  const datmouth = await core('test3', ram)
  datmouth.disconnect()
  datmouth.listenTail(cb)
  await sleep(500)
  await datmouth.publish(msg)
  await sleep(1000)
  function cb (tail) {
    t.deepEqual(tail.value.text, msg, 'should receive last message published')
  }
})

function sleep (ms) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms)
  })
}

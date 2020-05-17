const test = require('tape')
const templates = require('../templates')

test('message template', function (t) {
  t.plan(1)
  const actual = templates.message({ nickname: 'dude', text: 'message', timestamp: '2020-05-17T16:45:15.551Z' })
  const re = /\d{2}:\d{2}\sdude:\smessage/

  t.deepEqual(re.test(actual), true)
})

test('history template', function (t) {
  t.plan(1)
  const actual = templates.history({ nickname: 'dude', text: 'message', timestamp: '2020-05-17T16:45:15.551Z' })
  const re = /\d{2}:\d{2}\sdude:\smessage/

  t.deepEqual(re.test(actual), true)
})

test('daychange template', function (t) {
  t.plan(1)
  const actual = templates.daychange({ text: 'message' })
  const expected = '\nmessage messages:'
  t.deepEqual(actual, expected)
})

test('connected template', function (t) {
  t.plan(1)
  const actual = templates.connected(3)
  const expected = '📡  3 peer(s)'
  t.deepEqual(actual, expected)
})

const test = require('tape')
const views = require('../views')

test('filterMessageView should filter messages without timestamp', function (t) {
  t.plan(1)
  const msg = { value: { type: 'chat' } }
  const cb = (e, actual) => {
    t.deepEqual(actual, undefined)
  }
  views.filterMessageView(msg, cb)
})

test('filterMessageView should filter messages without type chat', function (t) {
  t.plan(1)
  const msg = { value: { timestamp: '2020-05-17T16:45:15.551Z"' } }
  const cb = (e, actual) => {
    t.deepEqual(actual, undefined)
  }
  views.filterMessageView(msg, cb)
})

test('filterMessageView should use callback with with msg timestamp when matching a valid message', function (t) {
  t.plan(1)
  const msg = { value: { timestamp: '2020-05-17T16:45:15.551Z', type: 'chat' } }
  const cb = (e, actual) => {
    const expected = ['2020-05-17T16:45:15.551Z']
    t.deepEqual(actual, expected)
  }
  views.filterMessageView(msg, cb)
})

test('filterMessageView should filter incorrect timestamps', function (t) {
  t.plan(1)
  const msg = { value: { timestamp: '2020-05-17', type: 'chat' } }
  const cb = (e, actual) => {
    t.deepEqual(actual, undefined)
  }
  views.filterMessageView(msg, cb)
})

const test = require('tape')
const views = require('../utils')
const fixtures = require('./fixtures.json')

test('aggregateDateLines should add change date lines to messages view list', function (t) {
  t.plan(1)
  const actual = views.aggregateDateLines(fixtures.rawMessages)
  const expected = fixtures.messagesWithDateLines

  t.deepEqual(actual, expected)
})

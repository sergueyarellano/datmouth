const test = require('tape')
const utils = require('../utils')
const fixtures = require('./fixtures.json')

test('aggregateDateLines() should add change date lines to messages view list', function (t) {
  t.plan(1)
  const actual = utils.aggregateDateLines(fixtures.rawMessages)
  const expected = fixtures.messagesWithDateLines

  t.deepEqual(actual, expected)
})

test('slug() trims spaces, replaces spaces with dashes and lowercase', function (t) {
  t.plan(1)

  const actual = utils.slug('My name ')
  const expected = 'my-name'

  t.deepEqual(actual, expected)
})

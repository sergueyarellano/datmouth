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

test('getTimeShort should shorten the timestamp', function (t) {
  t.plan(2)
  // Will return shortened time with GMT offset
  const actual = utils.getTimeShort('2020-05-17T16:45:15.551Z')
  const re = /^\d{2}:\d{2}/
  const expectedMinutes = '45'

  t.deepEqual(re.test(actual), true)
  t.deepEqual(actual.slice(3), expectedMinutes)
})

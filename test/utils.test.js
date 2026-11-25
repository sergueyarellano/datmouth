import test from 'node:test'
import assert from 'node:assert/strict'
import * as utils from '../utils.js'

const msg = (timestamp, text) => ({ value: { type: 'chat', timestamp, text } })

test('aggregateDateLines() adds a daychange line whenever the day changes', () => {
  const day1a = msg('2020-05-17T10:00:00.000Z', 'a')
  const day1b = msg('2020-05-17T11:00:00.000Z', 'b')
  const day2 = msg('2020-05-19T11:00:00.000Z', 'c')
  const dateLine = (m) => ({ value: { type: 'daychange', text: new Date(m.value.timestamp).toDateString() } })

  assert.deepEqual(
    utils.aggregateDateLines([day1a, day1b, day2]),
    [dateLine(day1a), day1a, day1b, dateLine(day2), day2]
  )
})

test('slug() trims spaces, replaces spaces with dashes and lowercase', () => {
  assert.equal(utils.slug('My name '), 'my-name')
})

test('getTimeShort should shorten the timestamp', () => {
  const actual = utils.getTimeShort('2020-05-17T16:45:15.551Z')
  assert.match(actual, /^\d{2}:\d{2}$/)
  assert.equal(actual.slice(3), '45')
})

test('createNickname gives a 7 char lowercase id', () => {
  assert.match(utils.createNickname(), /^[a-z0-9]{7}$/)
})

test('getProperColorModel falls back to magenta on bad input', () => {
  assert.equal(typeof utils.getProperColorModel('#zzz'), 'function')
  assert.equal(typeof utils.getProperColorModel('nope'), 'function')
})

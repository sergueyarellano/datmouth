import test from 'node:test'
import assert from 'node:assert/strict'
import { stripVTControlCharacters as strip } from 'node:util'
import templates from '../templates.js'

test('message template', () => {
  const actual = templates.message({ nickname: 'dude', text: 'message', timestamp: '2020-05-17T16:45:15.551Z' })
  assert.match(strip(actual), /\d{2}:\d{2}\sdude:\smessage/)
})

test('history template', () => {
  const actual = templates.history({ nickname: 'dude', text: 'message', timestamp: '2020-05-17T16:45:15.551Z' })
  assert.match(strip(actual), /\d{2}:\d{2}\sdude:\smessage/)
})

test('history template shows ascii reactions by name', () => {
  const actual = templates.history({ nickname: 'dude', text: ':ascii#boom', timestamp: '2020-05-17T16:45:15.551Z' })
  assert.match(strip(actual), /dude: \*boom\*$/)
})

test('daychange template', () => {
  assert.equal(templates.daychange({ text: 'message' }), '\nmessage messages:')
})

test('connected template', () => {
  assert.equal(strip(templates.connected(3)), '📡  3 active connections')
})

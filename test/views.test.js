import test from 'node:test'
import assert from 'node:assert/strict'
import { isValidMessage } from '../views.js'

test('isValidMessage rejects messages without timestamp', () => {
  assert.equal(isValidMessage({ type: 'chat' }), false)
})

test('isValidMessage rejects messages without type chat', () => {
  assert.equal(isValidMessage({ timestamp: '2020-05-17T16:45:15.551Z' }), false)
})

test('isValidMessage accepts a valid message', () => {
  assert.equal(isValidMessage({ timestamp: '2020-05-17T16:45:15.551Z', type: 'chat' }), true)
})

test('isValidMessage rejects incorrect timestamps', () => {
  assert.equal(isValidMessage({ timestamp: '2020-05-17', type: 'chat' }), false)
})

test('isValidMessage rejects garbage', () => {
  assert.equal(isValidMessage(null), false)
  assert.equal(isValidMessage('chat'), false)
})

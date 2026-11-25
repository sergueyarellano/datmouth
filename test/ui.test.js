import test from 'node:test'
import assert from 'node:assert/strict'
import { getCompleter, countRows } from '../ui.js'

const completer = getCompleter(() => ['/help', '/history', '@dude'])

test('completer completes a unique command', () => {
  assert.deepEqual(completer('/he'), [['/help'], '/he'])
})

test('completer lists several hits', () => {
  assert.deepEqual(completer('/h'), [['/help', '/history'], '/h'])
})

test('completer completes a nickname mid sentence', () => {
  assert.deepEqual(completer('hey @du'), [['hey @dude'], 'hey @du'])
})

test('countRows counts wrapped and wide lines', () => {
  assert.equal(countRows('abc\ndef', 80), 2)
  assert.equal(countRows('x'.repeat(100), 60), 2)
  assert.equal(countRows('(・ω・)', 6), 2)
})

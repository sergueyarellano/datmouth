import test from 'node:test'
import assert from 'node:assert/strict'
import { ART, findArt, getArt, listArt, normalizeFrames } from '../art.js'

test('every reaction is well formed', () => {
  const seen = new Set()
  for (const art of ART) {
    assert.ok(art.frames.length >= 1, art.names[0])
    assert.ok(art.fps > 0 && art.loops > 0, art.names[0])
    for (const name of art.names) {
      assert.match(name, /^[^\s#]+$/, 'names must survive the ":ascii#name" wire format')
      assert.ok(!seen.has(name), `duplicate name ${name}`)
      seen.add(name)
    }
    for (const frame of art.frames) {
      for (const line of frame.split('\n')) assert.ok([...line].length <= 30, `${art.names[0]} is too wide`)
    }
  }
})

test('findArt matches names, aliases and prefixes', () => {
  assert.equal(findArt('boom').names[0], 'boom')
  assert.equal(findArt('LOVE').names[0], 'heart')
  assert.equal(findArt('table').names[0], 'tableflip')
  assert.equal(findArt('nothing-like-this'), null)
  assert.equal(findArt(''), null)
  assert.ok(ART.includes(findArt('random')))
})

test('getArt is exact', () => {
  assert.equal(getArt('boom').names[0], 'boom')
  assert.equal(getArt('boo'), null)
})

test('listArt lists canonical names', () => {
  assert.deepEqual(listArt(), ART.map(a => a.names[0]))
})

test('normalizeFrames pads frames to the same height', () => {
  const frames = normalizeFrames(['a', 'b\nc\nd'])
  assert.deepEqual(frames.map(f => f.split('\n').length), [3, 3])
})

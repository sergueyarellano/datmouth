import test from 'node:test'
import assert from 'node:assert/strict'
import { parseCommandLine, resolveCommand, usage, COMMANDS } from '../cmdline.js'
import { ART } from '../art.js'

test('every short form between the minimum and the full name resolves', () => {
  for (const cmd of COMMANDS) {
    for (let i = cmd.min.length; i <= cmd.name.length; i++) {
      assert.equal(resolveCommand(cmd.name.slice(0, i)), cmd.name, cmd.name.slice(0, i))
    }
  }
})

test('short forms do not collide', () => {
  assert.equal(resolveCommand('n'), null)
  assert.equal(resolveCommand('co'), null)
  assert.equal(resolveCommand('his'), 'messages')
  assert.equal(resolveCommand('conn'), null)
})

test('only : starts a command', () => {
  assert.deepEqual(parseCommandLine(':h'), { command: 'help', args: [] })
  assert.deepEqual(parseCommandLine(':HELP'), { command: 'help', args: [] })
  for (const line of ['/help', '\\h', '/q']) assert.equal(parseCommandLine(line), null, line)
})

test('vim quit spellings all quit', () => {
  for (const line of [':q', ':q!', ':wq', ':x', ':qa', ':quit', ':exit']) {
    assert.equal(parseCommandLine(line).command, 'quit', line)
  }
})

test('arguments are passed through', () => {
  assert.deepEqual(parseCommandLine(':ni  dude  bro'), { command: 'nick', args: ['dude', 'bro'] })
  assert.deepEqual(parseCommandLine(':colo #DEADED'), { command: 'colorscheme', args: ['#DEADED'] })
})

test('reactions play directly by name or alias', () => {
  assert.deepEqual(parseCommandLine(':boom'), { command: 'ascii', args: ['boom'] })
  assert.deepEqual(parseCommandLine(':love'), { command: 'ascii', args: ['heart'] })
  assert.deepEqual(parseCommandLine(':+1'), { command: 'ascii', args: ['ok'] })
  assert.deepEqual(parseCommandLine(':random'), { command: 'ascii', args: ['random'] })
})

test('no reaction name is shadowed by a command', () => {
  for (const name of ART.flatMap(a => a.names).concat('random')) {
    assert.equal(resolveCommand(name), null, name)
  }
})

test('emoticons are chat, unknown words are errors', () => {
  for (const line of [':)', ':D', ':-P', ':ascii#boom', 'hello']) {
    assert.equal(parseCommandLine(line), null, line)
  }
  assert.deepEqual(parseCommandLine(':foo'), { command: null, input: ':foo' })
})

test('usage shows the vim style abbreviation', () => {
  assert.equal(usage('help'), ':h[elp]')
  assert.equal(usage('messages'), ':mes[sages]')
})

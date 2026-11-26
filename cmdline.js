import { ART, getArt } from './art.js'

export const COMMANDS = [
  { name: 'help', min: 'h' },
  { name: 'quit', min: 'q', aliases: ['exit', 'wq', 'x', 'qa', 'wqa', 'xa'] },
  { name: 'nick', min: 'ni' },
  { name: 'messages', min: 'mes', aliases: [{ name: 'history', min: 'his' }] },
  { name: 'colorscheme', min: 'colo' },
  { name: 'ascii', min: 'a' },
  { name: 'peers', min: 'pe' }
]

const forms = COMMANDS.flatMap(cmd => [
  { name: cmd.name, min: cmd.min, command: cmd.name },
  ...(cmd.aliases || []).map(a => typeof a === 'string'
    ? { name: a, min: a, command: cmd.name }
    : { name: a.name, min: a.min, command: cmd.name })
])

export function resolveCommand (word) {
  const w = word.toLowerCase().replace(/!$/, '')
  if (!w) return null
  const form = forms.find(f => f.name === w) ||
    forms.find(f => w.startsWith(f.min) && f.name.startsWith(w))
  return form ? form.command : null
}

export function parseCommandLine (line) {
  if (!line.startsWith(':')) return null
  const words = line.slice(1).trim().split(/\s+/).filter(Boolean)
  const command = words.length ? resolveCommand(words[0]) : null
  if (command) return { command, args: words.slice(1) }
  const reaction = words.length && reactionName(words[0])
  if (reaction) return { command: 'ascii', args: [reaction] }
  if (/^[a-z]+$/.test(words[0] || '')) return { command: null, input: line.trim() }
  return null
}

function reactionName (word) {
  const w = word.toLowerCase()
  if (w === 'random') return w
  const art = getArt(w)
  return art ? art.names[0] : null
}

export function completions () {
  return forms.map(f => ':' + f.name)
    .concat(ART.flatMap(a => a.names).map(n => ':' + n), ':random')
}

export function usage (name) {
  const cmd = COMMANDS.find(c => c.name === name)
  const rest = cmd.name.slice(cmd.min.length)
  return ':' + cmd.min + (rest ? '[' + rest + ']' : '')
}

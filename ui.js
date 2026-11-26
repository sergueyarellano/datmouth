import readline from 'node:readline'
import { stripVTControlCharacters } from 'node:util'
import { parseCommandLine, completions } from './cmdline.js'

export function createUI ({ prompt = '> ', onLine = () => {}, commands = {}, templates = {}, input = process.stdin, output = process.stdout } = {}) {
  const extraCompletions = new Set()
  const getCompletions = () => completions().concat([...extraCompletions])

  const rl = readline.createInterface({
    input,
    output,
    prompt,
    completer: getCompleter(getCompletions)
  })
  const tty = Boolean(output.isTTY)

  let live = null

  function draw (text, { replaceLive = false } = {}) {
    const promptRows = rl.getCursorPos().rows
    const up = promptRows + (replaceLive && live ? live.rows : 0)
    readline.moveCursor(output, 0, -up)
    readline.cursorTo(output, 0)
    readline.clearScreenDown(output)
    output.write(text + '\n' + '\n'.repeat(promptRows))
    rl.prompt(true)
  }

  function print (text = '') {
    if (!tty) {
      output.write(text + '\n')
      return
    }
    if (live) {
      const { last } = live
      draw(last, { replaceLive: true })
      live = null
    }
    draw(text)
  }

  function animate (frames, { fps = 4, loops = 1 } = {}) {
    const sequence = []
    for (let i = 0; i < loops; i++) sequence.push(...frames)
    if (!tty || sequence.length < 2) {
      print(frames[frames.length - 1])
      return Promise.resolve()
    }
    print(sequence[0])
    const token = { rows: countRows(sequence[0], output.columns), last: sequence[sequence.length - 1] }
    live = token
    let i = 1
    return new Promise(resolve => {
      const timer = setInterval(() => {
        if (live !== token || i >= sequence.length) {
          clearInterval(timer)
          if (live === token) live = null
          return resolve()
        }
        draw(sequence[i], { replaceLive: true })
        token.rows = countRows(sequence[i], output.columns)
        i++
      }, Math.round(1000 / fps))
    })
  }

  rl.on('line', async (line) => {
    if (tty) eraseSubmittedLine(output, rl.getPrompt(), line)
    try {
      const parsed = parseCommandLine(line)
      if (parsed && typeof commands[parsed.command] === 'function') await commands[parsed.command](...parsed.args)
      else if (parsed) print(`E492: Not an editor command: ${parsed.input}  (try :h)`)
      else if (line.trim().length > 0) await onLine(line)
    } catch (err) {
      print(`⚠️  ${err.message}`)
    }
    rl.prompt()
  })

  rl.prompt()

  return {
    print,
    animate,
    log: (templateName, payload) => {
      const template = templates[templateName] || (() => `Did not find a template with the name "${templateName}"`)
      print(template(payload))
    },
    setPrompt: (p) => { rl.setPrompt(p); rl.prompt(true) },
    setCompletion: (completion) => { extraCompletions.add(completion) },
    rl
  }
}

function eraseSubmittedLine (output, prompt, line) {
  const columns = output.columns || 80
  const width = stripVTControlCharacters(prompt).length + line.length
  const rows = Math.floor(width / columns) + 1
  readline.moveCursor(output, 0, -rows)
  readline.cursorTo(output, 0)
  readline.clearScreenDown(output)
}

export function countRows (text, columns = 80) {
  return text.split('\n').reduce((n, line) => {
    const width = [...stripVTControlCharacters(line)].reduce((w, ch) => w + (ch.codePointAt(0) > 0x2e80 ? 2 : 1), 0)
    return n + Math.max(1, Math.ceil(width / columns))
  }, 0)
}

export function getCompleter (getCompletions) {
  return (line) => {
    if (!line.length) return [[], line]

    const lineMatch = line.match(/(?:.*)?([:.@#][^\s]*)/)
    const possibleHit = lineMatch && lineMatch[1]
    if (!possibleHit) return [[], line]

    const hits = getCompletions().filter((c) => c.startsWith(possibleHit))
    if (hits.length === 1 && hits[0] === possibleHit) return [[], line]
    if (hits.length === 1) {
      return [[line.substring(0, line.lastIndexOf(possibleHit)) + hits[0]], line]
    }
    return [hits, line]
  }
}

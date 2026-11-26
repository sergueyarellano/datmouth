import { createRequire } from 'node:module'
import createDATMouth from './core.js'
import * as utils from './utils.js'
import * as commands from './commands.js'
import chalk from 'chalk'
import templates, { ASCII_RE } from './templates.js'
import { createUI } from './ui.js'
import { getArt, normalizeFrames } from './art.js'

const { version } = createRequire(import.meta.url)('./package.json')

export default async function client (topic, { swarmOpts } = {}) {
  const datmouth = await createDATMouth(topic, { swarmOpts })
  let cli = null
  const print = (text) => cli.print(text)
  const log = (type, content) => cli.log(type, content)
  const setPrompt = (prompt) => cli.setPrompt(prompt)

  const exit = async () => {
    print('See ya! ;)')
    cli.rl.close()
    await Promise.race([datmouth.disconnect(), new Promise(resolve => setTimeout(resolve, 2000))])
    process.exit(0)
  }

  cli = createUI({
    prompt: utils.composePrompt({ nick: datmouth.getNickname(), color: datmouth.getColor() }),
    onLine: datmouth.publish,
    templates,
    commands: {
      help: commands.help({ print }),
      quit: exit,
      nick: commands.getNickname({ datmouth, setPrompt }),
      messages: commands.getHistory({ datmouth, log }),
      colorscheme: commands.getColorscheme({ datmouth, setPrompt, print }),
      ascii: commands.getAscii({ datmouth, print }),
      peers: () => log('connected', datmouth.getActiveConnections())
    }
  })

  cli.rl.on('SIGINT', exit) // exit on <ctrl>-C
  log('welcome', { topic, timestamp: datmouth.getTimeOfLastConnection(), version })

  datmouth.onPeer((change, { local }) => log('peer', { added: change === 'add', local }))
  datmouth.onWarning(() => {})

  datmouth.listenTail((tail) => {
    const msgTimestampMS = new Date(tail.value.timestamp).getTime()
    const thresholdTime = datmouth.getTimeOfLastConnection()
    const text = String(tail.value.text)

    // Register nickname for completion
    cli.setCompletion('@' + tail.value.nickname)

    /*
      Show messages since the moment we connect.
      With every new connection we won't show the messages that others could have produced while offline.
    */
    if (thresholdTime >= msgTimestampMS) return

    const ascii = text.match(ASCII_RE)
    const art = ascii && getArt(ascii[1])
    if (!art) return log('message', tail.value)

    log('message', Object.assign({}, tail.value, { text: `*${art.names[0]}*` }))
    const paint = chalk[art.color] || (s => s)
    cli.animate(normalizeFrames(art.frames).map(f => paint(f)), { fps: art.fps, loops: art.loops })
  })
}

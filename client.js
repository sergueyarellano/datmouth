const entero = require('entero')
const core = require('./core')
const utils = require('./utils')
const commands = require('./commands')
const templates = require('./templates')

module.exports = client

async function client (topic) {
  const datmouth = await core(topic)
  const cli = entero({
    prompt: utils.composePrompt({
      nick: datmouth.getNickname(),
      color: datmouth.getColor()
    }),
    onLine: datmouth.publish,
    templates,
    commands: {
      nick: commands.getNickname({ datmouth, setPrompt: (prompt) => cli.rl.setPrompt(prompt) }),
      history: commands.getHistory({ datmouth, log: (type, content) => cli.log(type, content) }),
      color: commands.getColor({ datmouth, setPrompt: (prompt) => cli.rl.setPrompt(prompt) }),
      colors: commands.colors, // list color support
      help: commands.help,
      giphy: commands.getGiphy({ datmouth }),
      connected: () => cli.log('connected', datmouth.getActiveConnections()),
      exit: () => console.log('See ya! ;)') || process.exit(0)
    }
  })

  cli.rl.on('SIGINT', process.exit) // exit on <ctrl>-C
  cli.log('welcome', { topic, timestamp: datmouth.getTimeOfLastConnection() })

  datmouth.listenTail((tail) => {
    const msgTimestampMS = new Date(tail.value.timestamp).getTime()
    const thresholdTime = datmouth.getTimeOfLastConnection()
    const text = tail.value.text
    /*
    Show messages since the moment we connect.
    With every new connection we won't show the messages that others could have produced while offline.
  */
    if (thresholdTime < msgTimestampMS) {
      if (text.startsWith(':gif#')) {
        const url = text.match(/http.*/)[0]
        const hit = text.match(/#.+#/)[0]
        cli.log('message', Object.assign(tail.value, { text: '\n' + hit }))
        // TODO: User prompt gets blocked while the gif is displaying.
        // it is not too much, but affects UX IMO
        utils.showImage(url)
      } else {
        cli.log('message', tail.value)
      }
    }
  })
}

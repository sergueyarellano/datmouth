const entero = require('entero')
const chalk = require('chalk')
const core = require('./core')
const utils = require('./utils')
const commands = require('./commands')
const templates = require('./templates')({ chalk, utils })

module.exports = client

async function client (topic, suffix = '') {
  const datmouth = await core(topic, suffix)
  const cli = entero({
    prompt: utils.composePrompt({
      nick: datmouth.getNickname(),
      color: datmouth.getColor(),
      chalk
    }),
    onLine: datmouth.publish,
    templates,
    commands: {
      nick: commands.getNickname({ datmouth, setPrompt: (prompt) => cli.rl.setPrompt(prompt) }),
      history: commands.getHistory({ datmouth, log: (type, content) => cli.log(type, content) }),
      color: commands.getColor({ datmouth, setPrompt: (prompt) => cli.rl.setPrompt(prompt) }),
      colors: commands.colors, // list color support
      help: commands.help
    }
  })

  cli.rl.on('SIGINT', process.exit) // exit on <ctrl>-C
  cli.log('welcome', { topic, timestamp: datmouth.getTimeOfLastConnection() })

  datmouth.listenTail((tail) => {
    const msgTimestampMS = new Date(tail.value.timestamp).getTime()
    const thresholdTime = datmouth.getTimeOfLastConnection()

    /*
    Show messages since the moment we connect.
    With every new connection we won't show the messages that others could have produced while offline.
  */
    thresholdTime < msgTimestampMS && cli.log('message', tail.value)
  })
}

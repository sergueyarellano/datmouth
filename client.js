const entero = require('entero')
const chalk = require('chalk')
const core = require('./core')
const utils = require('./utils')
const commands = require('./commands')
const templates = require('./templates')({ chalk, utils })

module.exports = client

async function client (topic, suffix = '') {
  const datMouth = await core(topic, suffix)

  const cli = entero({
    prompt: chalk.magenta(`@${datMouth.getNickname()}> `),
    onLine: datMouth.publish,
    templates,
    commands: {
      nick: commands.getNickname({
        slug: utils.slug,
        updateNickname: datMouth.updateNickname,
        setPrompt: (prompt) => cli.rl.setPrompt(prompt),
        chalk
      }),
      history: commands.getHistory({
        readLast: datMouth.readLast,
        aggregateDateLines: utils.aggregateDateLines,
        log: (type, content) => cli.log(type, content)
      }),
      help: commands.getHelp()
    }
  })

  cli.log('welcome', { topic, timestamp: datMouth.getTimeOfLastConnection() })

  datMouth.listenTail((tail) => {
    const msgTimestampMS = new Date(tail.value.timestamp).getTime()
    const thresholdTime = datMouth.getTimeOfLastConnection()

    /*
    Show messages since the moment we connect.
    With every new connection we won't show the messages that others could have produced while offline.
  */
    thresholdTime < msgTimestampMS && cli.log('message', tail.value)
  })
}

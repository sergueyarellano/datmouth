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
    prompt: utils.composePrompt({
      nick: datMouth.getNickname(),
      color: datMouth.getColor(),
      chalk
    }),
    onLine: datMouth.publish,
    templates,
    commands: {
      nick: commands.getNickname({
        slug: utils.slug,
        composePrompt: utils.composePrompt,
        getColor: datMouth.getColor,
        updateNickname: datMouth.updateNickname,
        setPrompt: (prompt) => cli.rl.setPrompt(prompt),
        chalk
      }),
      history: commands.getHistory({
        readLast: datMouth.readLast,
        aggregateDateLines: utils.aggregateDateLines,
        log: (type, content) => cli.log(type, content)
      }),
      help: commands.getHelp(chalk),
      colors: commands.getColors(chalk), // list color support
      color: (color = 'magenta') => {
        datMouth.setColor(color)
        const newPrompt = utils.composePrompt({
          nick: datMouth.getNickname(),
          color: datMouth.getColor(),
          chalk
        })
        cli.rl.setPrompt(newPrompt)
      }
    }
  })

  cli.rl.on('SIGINT', process.exit) // exit on <ctrl>-C
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

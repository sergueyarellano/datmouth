const core = require('./core')
const myUI = require('./ui')
const utils = require('./utils')

module.exports = client

async function client (topic, suffix = '') {
  const datMouth = await core(topic, suffix)
  const ui = myUI(datMouth.getNickname())

  ui.display({
    type: 'welcome',
    content: { topic, timestamp: datMouth.getTimeOfLastConnection() }
  })

  datMouth.listenTail(function (tail) {
    const nickname = datMouth.getNickname()
    const msgNickname = tail.value.nickname
    const msgTimestampMS = new Date(tail.value.timestamp).getTime()
    const thresholdTime = datMouth.getTimeOfLastConnection()

    /*
      Show messages since the moment we connect.
      With every new connection we won't show the messages that others could have produced while offline.
    */
    if (thresholdTime < msgTimestampMS) {
      nickname !== msgNickname && ui.display({
        type: 'message',
        content: tail.value
      })
    }
  })

  ui.setCommand('nick', function (...options) {
    const newNickname = datMouth.slug(options.join(' '))
    // nickname is preserved once user inputs a new line
    datMouth.updateNickname(newNickname)
    ui.setPrompt(newNickname)
  })

  // Since we are trying to avoid UI pollution,
  // with this command, the user can choose to see past messages
  ui.setCommand('history', async function (size) {
    const messages = await datMouth.readLast(size)
    const enhancedMessages = utils.aggregateDateLines(messages)

    enhancedMessages.forEach(msg => {
      msg.value.type === 'chat' && ui.display({ type: 'history', content: msg.value })
      msg.value.type === 'daychange' && ui.display({ type: 'daychange', content: msg.value })
    })
    ui.display({ type: 'shades' })
  })

  ui.setCommand('help', function () {
    ui.display({
      type: 'normal',
      content: {
        text: `
        E' un mondo difficile
        Ã¨ vita intensa
        felicitÃ  a momenti
        e futuro incerto

        Commands:
          /help                 Displays this message
          /nick yournickname    Changes your actual nickname
          /history 4            Displays last 4 messages received

        Emacs commands:
          CTRL-U                Remove from cursor to start of line
          CTRL-A                Go to start of the line
          CTRL-E                Go to end of the line
          ALT-B                 Move cursor backwards, word by word
          ALT-F                 Move cursor forward, word by word
        `
      }
    })
  })
  ui.onEnter(datMouth.publish)
}

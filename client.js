const core = require('./core')
const myUI = require('./ui')

module.exports = client

async function client (topic, localRef = '') {
  const datMouth = await core(topic, localRef)
  const ui = myUI(datMouth.getNickname())
  const startTimeMS = Date.now()
  ui.display({
    type: 'welcome',
    content: { topic, timestamp: startTimeMS }
  })

  datMouth.readTail(function (tail) {
    const nickname = datMouth.getNickname()
    const msgNickname = tail.value.nickname
    const msgTimestampMS = new Date(tail.value.timestamp).getTime()
    // We don't want to display our own messages
    // because we already have the prompt
    if (startTimeMS < msgTimestampMS) {
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
  ui.setCommand('help', function () {
    ui.display({
      type: 'normal',
      content: { text: 'No help for now' }
    })
  })
  ui.onEnter(datMouth.publish)
}

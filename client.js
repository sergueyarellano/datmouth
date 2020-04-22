const core = require('./core')
const myUI = require('./ui')

module.exports = client

async function client (topic, localRef = '') {
  const bucko = await core(topic, localRef)
  const ui = myUI(bucko.getNickname())

  bucko.readTail(function (tail) {
    const nickname = bucko.getNickname()
    const messageNick = tail.value.nickname

    // We don't want to display our own messages
    // because we already have the prompt
    nickname !== messageNick && ui.display('message', tail.value)
  })

  ui.setCommand('nick', function (line) {
    bucko.addNickname(line)
    ui.setPrompt(line)
  })
  ui.setCommand('help', function (line) {
    ui.display('help')
  })
  ui.onEnter(bucko.publish)
}

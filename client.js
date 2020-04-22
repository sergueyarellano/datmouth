const bucko = require('./core')
const argv = require('minimist')(process.argv.slice(2))
const myUI = require('./ui')

init()

async function init () {
  const aye = await bucko(argv.t, argv.l)
  const ui = myUI(aye.getNickname())

  aye.readTail(function (tail) {
    const nickname = aye.getNickname()
    const messageNick = tail.value.nickname

    // We don't want to display our own messages
    // because we already have the prompt
    nickname !== messageNick && ui.display('message', tail.value)
  })

  ui.setCommand('nick', function (line) {
    aye.addNickname(line)
    ui.setPrompt(line)
  })
  ui.setCommand('help', function (line) {
    ui.display('help')
  })
  ui.onEnter(aye.publish)
}

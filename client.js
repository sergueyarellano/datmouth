const core = require('./core')
const myUI = require('./ui')
const commands = require('./commands')
const utils = require('./utils')

module.exports = client

async function client (topic, suffix = '') {
  const datMouth = await core(topic, suffix)
  const ui = myUI(datMouth.getNickname())

  ui.display({
    type: 'welcome',
    content: { topic, timestamp: datMouth.getTimeOfLastConnection() }
  })
  ui.setCommand(...commands.createHelp({ display: ui.display }))
  ui.setCommand(...commands.createNick({
    slug: utils.slug,
    updateNickname: datMouth.updateNickname,
    setPrompt: ui.setPrompt
  }))
  ui.setCommand(...commands.createHistory({
    readLast: datMouth.readLast,
    aggregateDateLines: utils.aggregateDateLines,
    display: ui.display
  }))
  ui.onEnter(datMouth.publish)

  datMouth.listenTail(getTailHandler({
    getNickname: datMouth.getNickname,
    getTimeOfLastConnection: datMouth.getTimeOfLastConnection,
    display: ui.display
  }))
}

function getTailHandler ({ getNickname, getTimeOfLastConnection, display }) {
  return (tail) => {
    const nickname = getNickname()
    const msgNickname = tail.value.nickname
    const msgTimestampMS = new Date(tail.value.timestamp).getTime()
    const thresholdTime = getTimeOfLastConnection()

    /*
    Show messages since the moment we connect.
    With every new connection we won't show the messages that others could have produced while offline.
  */
    if (thresholdTime < msgTimestampMS) {
      nickname !== msgNickname && display({
        type: 'message',
        content: tail.value
      })
    }
  }
}

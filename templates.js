const chalk = require('chalk')
const utils = require('./utils')

module.exports = {
  welcome: ({ topic, timestamp }) => {
    return `⚓️ Joined ${chalk.bgMagenta(topic)} on ` +
    `${chalk.green(utils.getDateFromTimestamp(timestamp))} once upon a ` +
    `${chalk.green(utils.getTimeShort(timestamp))}h`
  },
  message: ({ timestamp, nickname, text, color }) => {
    return `${colorTimeStamp(timestamp)} 💬 ` +
    `${colorNickname(color, nickname)}${chalk.green.bold(':')} ${text}`
  },
  history: ({ timestamp, nickname, text, color = 'green' }) => {
    return `${colorTimeStamp(timestamp)} 💬 ` +
    `${colorNickname(color, nickname)}: ${colorMessage(text)}`
  },
  daychange: ({ text }) => `${text} messages:`,
  shades: () => '\n(っ▀¯▀)つ'
}

function colorNickname (color, nickname) {
  return utils.getProperColorModel(color)(nickname)
}

function colorTimeStamp (timestamp) {
  return chalk.blackBright(utils.getTimeShort(timestamp))
}

function colorMessage (text) {
  const gifLine = text.match('^(:gif#.+#)(.+)$')
  if (gifLine) return `${chalk.redBright(gifLine[1])} ${chalk.yellow(gifLine[2])}`
  return chalk.yellow(text)
}

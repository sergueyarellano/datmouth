module.exports = ({ chalk, utils }) => ({
  welcome: ({ topic, timestamp }) => {
    return `⚓️ Joined ${chalk.bgMagentaBright(topic)} on ` +
    `${chalk.green(utils.getDateFromTimestamp(timestamp))} once upon a ` +
    `${chalk.green(utils.getTimeShort(timestamp))}h`
  },
  message: ({ timestamp, nickname, text, color }) => {
    return `${chalk.blackBright(utils.getTimeShort(timestamp))} 💬 ` +
    `${utils.getProperColorModel(chalk, color)(nickname)}${chalk.green.bold(':')} ${text}`
  },
  history: ({ timestamp, nickname, text, color = 'green' }) => {
    return `${chalk.blackBright(utils.getTimeShort(timestamp))} 💬 ` +
    `${utils.getProperColorModel(chalk, color)(nickname)}: ${chalk.yellow(text)}`
  },
  daychange: ({ text }) => `${text} messages:`,
  shades: () => '\n(っ▀¯▀)つ'
})

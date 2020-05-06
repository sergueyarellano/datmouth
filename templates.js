module.exports = ({ chalk, utils }) => ({
  welcome: ({ topic, timestamp }) => `⚓️ Joined ${chalk.bgMagentaBright(topic)} on ${chalk.green(utils.getDateFromTimestamp(timestamp))} once upon a ${chalk.green(utils.getTimeFromTimestamp(timestamp))}`,
  message: ({ timestamp, nickname, text, color }) => `${utils.getTimeFromTimestamp(timestamp)} 💬 ${utils.getProperColorModel(chalk, color)(nickname)}${chalk.green.bold(':')} ${text}`,
  history: ({ timestamp, nickname, text, color = 'green' }) => `${utils.getTimeFromTimestamp(timestamp)} 💬 ${utils.getProperColorModel(chalk, color)(nickname)}: ${chalk.yellow(text)}`,
  daychange: ({ text }) => `${text} messages:`,
  shades: () => '\n(っ▀¯▀)つ'
})

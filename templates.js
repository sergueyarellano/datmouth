import chalk from 'chalk'
import * as utils from './utils.js'

export const ASCII_RE = /^:ascii#([^\s#]+)$/

export default {
  welcome: ({ topic, timestamp, version }) => {
    return `⚓️ Joined ${chalk.bgMagenta(topic)} on ` +
    `${chalk.green(utils.getDateFromTimestamp(timestamp))} once upon a ` +
    `${chalk.green(utils.getTimeShort(timestamp))}h - datmouth v${version}\n`
  },
  message: ({ timestamp, nickname, text, color = 'green' }) => {
    return `${colorTimeStamp(timestamp)} ` +
    `${colorNickname(color, nickname)}${chalk.green.bold(':')} ${highlight(text)}`
  },
  history: ({ timestamp, nickname, text, color = 'green' }) => {
    return `${colorTimeStamp(timestamp)} ` +
    `${colorNickname(color, nickname)}: ${colorMessage(text)}`
  },
  daychange: ({ text }) => `\n${text} messages:`,
  connected: (connections) => `📡  ${chalk.blueBright(connections)} active connections`,
  peer: ({ added, local }) => `📡 ${added ? chalk.green('+1') : chalk.red('-1')} peer ${local ? '(LAN)' : '(WAN)'}`,
  shades: () => '\n(っ▀¯▀)つ'
}

function colorNickname (color, nickname) {
  return utils.getProperColorModel(color)(nickname)
}

function highlight (text) {
  return text.replace(/@[^\s]+/g, chalk.bgBlackBright.bold('$&'))
}

function colorTimeStamp (timestamp) {
  return chalk.blackBright(utils.getTimeShort(timestamp))
}

function colorMessage (text) {
  const ascii = text.match(ASCII_RE)
  if (ascii) return chalk.redBright(`*${ascii[1]}*`)
  return chalk.yellow(text)
}

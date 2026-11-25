import crypto from 'node:crypto'
import chalk from 'chalk'

export function composePrompt ({ nick, color }) {
  return `@${getProperColorModel(color)(nick)}> `
}

export function getProperColorModel (color) {
  if (typeof color !== 'string') return chalk.magenta
  if (/^#([0-9a-f]{3}){1,2}$/i.test(color)) return chalk.hex(color)
  return typeof chalk[color] === 'function' ? chalk[color] : chalk.magenta
}

export function getTimestamp (date = Date.now()) {
  return new Date(date).toISOString()
}

export function aggregateDateLines (messages) {
  // we have a list of messages and we want to intercalete daychange objects.
  return messages.reduce((acc, message) => {
    const previousMessage = acc[acc.length - 1]
    const datePrevious = previousMessage && new Date(previousMessage.value.timestamp).toDateString()
    const dateCurrent = new Date(message.value.timestamp).toDateString()

    return (!previousMessage || datePrevious !== dateCurrent)
      ? acc.concat({ value: { type: 'daychange', text: dateCurrent } }, message)
      : acc.concat(message)
  }, [])
}

export function slug (s) {
  return s.trim().toLocaleLowerCase().replace(/\s+/g, '-')
}

export function createNickname () {
  return crypto.randomBytes(8).toString('base64url').replace(/[-_]/g, '').toLowerCase().slice(0, 7)
}

export function assignColor () {
  const colors = [
    'red', 'green', 'blue', 'white', 'blackBright', 'redBright',
    'greenBright', 'blueBright', 'magentaBright', 'cyanBright', 'whiteBright'
  ]
  return colors[getRandomInt(0, colors.length - 1)]
}

export function getRandomInt (min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function getTimeFromTimestamp (timestamp, locale = 'en-CA') {
  return new Date(timestamp).toLocaleTimeString(locale)
}

export function getDateFromTimestamp (timestamp, locale = 'en-CA') {
  return new Date(timestamp).toLocaleDateString(locale)
}

export function getTimeShort (timestamp) {
  const date = new Date(timestamp)
  return pad(date.getHours()) + ':' + pad(date.getMinutes())
}

function pad (n) {
  return String(n).padStart(2, '0')
}

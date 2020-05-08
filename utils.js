const cuid = require('cuid')
const fs = require('fs')
const termImg = require('term-img')
const tempy = require('tempy')
const pump = require('pump')
const got = require('got')
const chalk = require('chalk')
const publicIP = require('public-ip')

module.exports = {
  aggregateDateLines,
  slug,
  createNickname,
  assignColor,
  getTimestamp,
  getTimeFromTimestamp,
  getDateFromTimestamp,
  getTimeShort,
  getProperColorModel,
  composePrompt,
  getRandomInt,
  showImage,
  getIPV4FromIPV6,
  getPublicIP
}

function getPublicIP () {
  return publicIP.v4()
}

function getIPV4FromIPV6 (ipv6) {
  const ip = ipv6.match(/.*:(.*)/)
  return ip ? ipv6.match(/.*:(.*)/)[1] : ipv6
}

function composePrompt ({ nick, color }) {
  return `@${getProperColorModel(color)(nick)}> `
}

function getProperColorModel (color) {
  return color.startsWith('#') ? chalk.hex(color) : (typeof chalk[color] === 'function' ? chalk[color] : chalk.magenta)
}

function getTimestamp (date = Date.now()) {
  return new Date().toISOString()
}

function showImage (url) {
  const path = tempy.file()
  const image = fs.createWriteStream(path)

  image.on('finish', () => {
    const imag = termImg.string(path, { width: 20 })
    console.log(imag)
  })
  pump(got.stream(url), image)
}

function aggregateDateLines (messages) {
  // we have a list of messages and we want to intercalete daychange objects.
  return messages.reduce((acc, message) => {
    const lastIndex = acc.length - 1
    const previousMessage = acc[lastIndex]
    const datePrevious = previousMessage && new Date(previousMessage.value.timestamp).toDateString()
    const dateCurrent = new Date(message.value.timestamp).toDateString()

    // if it is the start of the list or if the day changed from previous element,
    // append a daychange object
    return (!previousMessage || datePrevious !== dateCurrent)
      ? acc
        .concat({
          value: {
            type: 'daychange',
            text: dateCurrent
          }
        })
        .concat(message)
      : acc.concat(message) // if not, just append the current message
  }, [])
}

function slug (s) {
  return s.trim().toLocaleLowerCase().replace(/\s/g, '-')
}

function createNickname () {
  return cuid().slice(-7)
}

function assignColor () {
  const colors = [
    'red', 'green', 'blue', 'white', 'blackBright', 'redBright',
    'greenBright', 'blueBright', 'magentaBright', 'cyanBright', 'whiteBright'
  ]
  const randomIndex = getRandomInt(0, colors.length - 1)
  return colors[randomIndex]
}

function getRandomInt (min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getTimeFromTimestamp (timestamp, locale = 'en-CA') {
  return new Date(timestamp).toLocaleTimeString(locale)
}

function getDateFromTimestamp (timestamp, locale = 'en-CA') {
  return new Date(timestamp).toLocaleDateString(locale)
}

function getTimeShort (timestamp) {
  const date = new Date(timestamp)
  const hours = addZeros(date.getHours().toString())
  const minutes = addZeros(date.getMinutes().toString())
  return hours + ':' + minutes
}

function addZeros (s) {
  return s.length === 1 ? `0${s}` : s
}

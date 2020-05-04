const cuid = require('cuid')

module.exports = {
  aggregateDateLines,
  slug,
  createNickname,
  assignColor,
  getTimestamp
}

function getTimestamp (date = Date.now()) {
  return new Date().toISOString()
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

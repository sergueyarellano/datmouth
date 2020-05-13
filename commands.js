const chalk = require('chalk')
const got = require('got')
const utils = require('./utils')

module.exports = {
  getNickname,
  getHistory,
  getColor,
  getGiphy,
  help,
  colors
}

function getGiphy ({ datmouth }) {
  return async (...hit) => {
    const query = hit.join(' ')
    const searchParams = new URLSearchParams([['api_key', 'dc6zaTOxFJmzC'], ['q', query]])
    const { body: { data } } = await got('https://api.giphy.com/v1/gifs/search', {
      responseType: 'json',
      searchParams
    }).catch(e => ({ body: { data: null } }))

    if (data) {
      const randomIndex = utils.getRandomInt(0, data.length - 1)
      const url = data[randomIndex].images.original.url
      datmouth.publish(':gif#' + query + '#' + url)
    } else {
      console.log('Could not grab the gif right now :(')
    }
  }
}

function colors (...options) {
  process.stdout.write(`
                  ${chalk.italic(' -- Only you can see this')}

    (╯°□°）╯︵ ┻━┻ 

    1 Basic color support (16 colors):
      try:
      /color red

      https://www.npmjs.com/package/chalk#colors

    2 256 color support and Truecolor support (16 million colors)
      try:
      /color ##DEADED

      #C4462D red     #EA8A25 orange  #F4F008 yellow
      #77F408 green   #08B7F4 blue    #F008F4 pink

      https://htmlcolorcodes.com/color-picker/

      (Wrong pick defaults to magenta)

                  ${chalk.italic('Only you can see this --')}
    `)
  console.log('')
}

function getColor ({ datmouth, setPrompt }) {
  return (color = 'magenta') => {
    datmouth.setColor(color)
    const newPrompt = utils.composePrompt({
      nick: datmouth.getNickname(),
      color: datmouth.getColor()
    })
    setPrompt(newPrompt)
  }
}

function getNickname ({ setPrompt, datmouth }) {
  return (...options) => {
    const newNickname = utils.slug(options.join(' '))
    // nickname is preserved once user inputs a new line
    datmouth.updateNickname(newNickname)
    setPrompt(utils.composePrompt({ nick: newNickname, color: datmouth.getColor() }))
  }
}

function getHistory ({ datmouth, log }) {
  return async function (size) {
    const messages = await datmouth.readLast(size)
    const enhancedMessages = utils.aggregateDateLines(messages)

    enhancedMessages.forEach(msg => {
      msg.value.type === 'chat' && log('history', msg.value)
      msg.value.type === 'daychange' && log('daychange', msg.value)
    })
    log('shades')
  }
}

function help () {
  process.stdout.write(`
                  ${chalk.italic(' -- Only you can see this')}

    ...(っ▀¯▀)つ

    Commands:
      /help                 Displays this message
      /nick yournickname    Changes your actual nickname
      /history 4            Displays last 4 messages received
      /colors               Displays color support
      /color hexcolor       Changes nickname color
      /giphy query          Displays a gif in the terminal
      /connected            Shows number of peers connected
      /exit                 Close the app

    Emacs commands:
      CTRL-U                Remove from cursor to start of line
      CTRL-A                Go to start of the line
      CTRL-E                Go to end of the line
      ALT-B                 Move cursor backwards, word by word
      ALT-F                 Move cursor forward, word by word

                  ${chalk.italic('Only you can see this --')}
    `)
  console.log('')
}

import chalk from 'chalk'
import * as utils from './utils.js'
import { findArt, listArt } from './art.js'

export function getAscii ({ datmouth, print }) {
  return async (...words) => {
    const art = findArt(words.join(' '))
    if (art) return datmouth.publish(':ascii#' + art.names[0])
    const query = words.join(' ')
    print((query ? `No ASCII reaction called "${query}". ` : '') +
      'Try one of: ' + listArt().join(', ') + ', random')
  }
}

export function colors ({ print }) {
  return () => print(`
                  ${chalk.italic(' -- Only you can see this')}

    (╯°□°）╯︵ ┻━┻

    1 Basic color support (16 colors):
      try:
      /color red

      https://www.npmjs.com/package/chalk#colors

    2 256 color support and Truecolor support (16 million colors)
      try:
      /color #DEADED

      #C4462D red     #EA8A25 orange  #F4F008 yellow
      #77F408 green   #08B7F4 blue    #F008F4 pink

      https://htmlcolorcodes.com/color-picker/

      (Wrong pick defaults to magenta)

                  ${chalk.italic('Only you can see this --')}
    `)
}

export function getColor ({ datmouth, setPrompt }) {
  return (color = 'magenta') => {
    datmouth.setColor(color)
    setPrompt(utils.composePrompt({ nick: datmouth.getNickname(), color: datmouth.getColor() }))
  }
}

export function getNickname ({ setPrompt, datmouth }) {
  return (...options) => {
    const newNickname = utils.slug(options.join(' '))
    if (!newNickname) return
    // nickname is preserved once user inputs a new line
    datmouth.updateNickname(newNickname)
    setPrompt(utils.composePrompt({ nick: newNickname, color: datmouth.getColor() }))
  }
}

export function getHistory ({ datmouth, log }) {
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

export function help ({ print }) {
  return () => print(`
                  ${chalk.italic(' -- Only you can see this')}

    ...(っ▀¯▀)つ

    Commands:
      /help                 Displays this message
      /nick yournickname    Changes your actual nickname
      /history 4            Displays last 4 messages received
      /colors               Displays color support
      /color hexcolor       Changes nickname color
      /ascii boom           Sends an animated ASCII reaction (/ascii lists them)
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
}

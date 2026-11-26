import chalk from 'chalk'
import * as utils from './utils.js'
import { findArt, listArt } from './art.js'

export function getAscii ({ datmouth, print }) {
  return async (...words) => {
    const art = findArt(words.join(' '))
    if (art) return datmouth.publish(':ascii#' + art.names[0])
    const query = words.join(' ')
    print((query ? `No ASCII reaction called "${query}". ` : '') +
      'Try one of: ' + listArt().concat('random').map(n => ':' + n).join(' '))
  }
}

function colorHelp () {
  return `

    (╯°□°）╯︵ ┻━┻

    1 Basic color support (16 colors):
      try:
      :colo red

      https://www.npmjs.com/package/chalk#colors

    2 256 color support and Truecolor support (16 million colors)
      try:
      :colo #DEADED

      #C4462D red     #EA8A25 orange  #F4F008 yellow
      #77F408 green   #08B7F4 blue    #F008F4 pink

      https://htmlcolorcodes.com/color-picker/

      (Wrong pick defaults to magenta)

    `
}

export function getColorscheme ({ datmouth, setPrompt, print }) {
  return (color) => {
    if (!color) return print(colorHelp())
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

    ...(っ▀¯▀)つ

    Commands (Neovim style, the part in [brackets] is optional):
      :h[elp]               Displays this message
      :ni[ck] yournickname  Changes your actual nickname
      :mes[sages] 4         Displays last 4 messages received (also :his[tory])
      :colo[rscheme]        Displays color support
      :colo[rscheme] #hex   Changes nickname color
      :boom                 Sends an animated ASCII reaction (:a lists them all)
      :pe[ers]              Shows number of peers connected
      :q[uit]               Close the app (also :q! :wq :x :exit)

      Tab completes commands and @nicknames.

    Emacs commands:
      CTRL-U                Remove from cursor to start of line
      CTRL-A                Go to start of the line
      CTRL-E                Go to end of the line
      ALT-B                 Move cursor backwards, word by word
      ALT-F                 Move cursor forward, word by word

    `)
}

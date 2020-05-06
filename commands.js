module.exports = {
  getNickname,
  getHistory,
  getHelp,
  getColors
}

function getColors (chalk) {
  return (...options) => {
    console.log(`
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
    `)
  }
}

function getNickname ({ slug, updateNickname, setPrompt, composePrompt, chalk, getColor }) {
  return (...options) => {
    const newNickname = slug(options.join(' '))
    // nickname is preserved once user inputs a new line
    updateNickname(newNickname)
    setPrompt(composePrompt({ nick: newNickname, color: getColor(), chalk }))
  }
}

function getHistory ({ readLast, aggregateDateLines, log }) {
  return async function (size) {
    const messages = await readLast(size)
    const enhancedMessages = aggregateDateLines(messages)

    enhancedMessages.forEach(msg => {
      msg.value.type === 'chat' && log('history', msg.value)
      msg.value.type === 'daychange' && log('daychange', msg.value)
    })
    log('shades')
  }
}

function getHelp () {
  return () => console.log(`
    ...(っ▀¯▀)つ

    Commands:
      /help                 Displays this message
      /nick yournickname    Changes your actual nickname
      /history 4            Displays last 4 messages received
      /colors               Displays color support
      /color #B53014        Changes nickname color

    Emacs commands:
      CTRL-U                Remove from cursor to start of line
      CTRL-A                Go to start of the line
      CTRL-E                Go to end of the line
      ALT-B                 Move cursor backwards, word by word
      ALT-F                 Move cursor forward, word by word
    `)
}

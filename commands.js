module.exports = {
  getNickname,
  getHistory,
  getHelp
}

function getNickname ({ slug, updateNickname, setPrompt, chalk }) {
  return (...options) => {
    const newNickname = slug(options.join(' '))
    // nickname is preserved once user inputs a new line
    updateNickname(newNickname)
    setPrompt(chalk.magenta(`@${newNickname}> `))
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
    E' un mondo difficile
    Ã¨ vita intensa
    felicitÃ  a momenti
    e futuro incerto

    Commands:
      /help                 Displays this message
      /nick yournickname    Changes your actual nickname
      /history 4            Displays last 4 messages received

    Emacs commands:
      CTRL-U                Remove from cursor to start of line
      CTRL-A                Go to start of the line
      CTRL-E                Go to end of the line
      ALT-B                 Move cursor backwards, word by word
      ALT-F                 Move cursor forward, word by word
    `)
}

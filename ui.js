const sl = require('serverline')
const chalk = require('chalk')

module.exports = function ui (nickname) {
  // start ui with prompt at the top of terminal
  process.stdout.write('\x1Bc')
  sl.init()
  sl.setPrompt(chalk.magenta(`@${nickname}> `))
  sl.on('SIGINT', function (rl) {
    rl.question('Confirm exit: ', (answer) => answer.match(/^y(es)?$/i) ? process.exit(0) : rl.output.write('\x1B[1K> '))
  })
  sl.isMuted() && sl.setMuted(false)
  const completion = []
  const commands = {}

  return {
    display,
    setCommand: (name, fn) => {
      commands[name] = fn
      completion.push('/' + name)
      sl.setCompletion(completion)
    },
    setPrompt: (value) => sl.setPrompt(chalk.magenta(`@${value}> `)),
    onEnter: (fn) => sl.on('line', function (line) {
      const isCommand = /^[/]/.test(line)

      if (isCommand) {
        const args = line.split(/\s/)
        const commandInput = args[0].slice(1) // remove the slash from the command
        const command = commands[commandInput] || (() => {})
        const options = args.slice(1)
        command(...options)
      } else line.length > 0 && fn(line)
    })
  }
}

function display (type, value = {}) {
  const types = {
    message: (value) => console.log(`${getTimeFromTimestamp(value.timestamp)} 💬 ${chalk.green(value.nickname)}: ${value.text}`),
    help: () => console.log('Fock ya lad, no help naw!')
  }

  const log = types[type] || ((value) => console.log('[log type not defined]', value))
  log(value)
}

function getTimeFromTimestamp (timestamp, locale = 'en-CA') {
  return new Date(timestamp).toLocaleTimeString(locale)
}

const sl = require('serverline')
const chalk = require('chalk')

module.exports = function ui (nickname) {
  // process.stdout.write('\x1Bc') // start ui with prompt at the top of terminal
  sl.init({ prompt: chalk.magenta(`@${nickname}> `) })
  const completion = []
  const commands = {}

  return {
    display,
    setCommand: (name, fn) => {
      commands[name] = fn
      completion.push('/' + name)
      // update serverline's completion each time
      sl.setCompletion(completion)
    },
    setPrompt: (value) => sl.setPrompt(chalk.magenta(`@${value}> `)),
    onEnter: (fn) => sl.on('line', function (line) {
      const isCommand = /^[/]/.test(line)

      if (isCommand) {
        const [_, type, options] = line.match(/^\/(\w+)(?:\s*)(.*)$/) // eslint-disable-line

        const command = commands[type] || (() => {})
        const optionsList = options.trim().split(/\s+/)
        command(...optionsList)
      } else line.length > 0 && fn(line)
    })
  }
}

function display ({ content = {}, type = '' }) {
  const log = console.log.bind(console)
  const types = {
    message: ({ timestamp, nickname, text, color }) => log(`${getTimeFromTimestamp(timestamp)} 💬 ${chalk[color].bold(nickname)}${chalk.green.bold(':')} ${text}`),
    history: ({ timestamp, nickname, text, color = 'green' }) => log(`${getTimeFromTimestamp(timestamp)} 💬 ${chalk[color].bold(nickname)}: ${chalk.yellow(text)}`),
    welcome: ({ topic, timestamp }) => log(`⚓️ Joined ${chalk.bgMagentaBright(topic)} on ${chalk.green(getDateFromTimestamp(timestamp))} once upon a ${chalk.green(getTimeFromTimestamp(timestamp))}`),
    daychange: ({ text }) => log(`${text} messages:`),
    shades: () => log('\n(っ▀¯▀)つ'),
    normal: ({ text }) => log(text)
  }

  const output = types[type] || ((value) => log('[log type not defined]:', type))
  output(content)
}

function getTimeFromTimestamp (timestamp, locale = 'en-CA') {
  return new Date(timestamp).toLocaleTimeString(locale)
}

function getDateFromTimestamp (timestamp, locale = 'en-CA') {
  return new Date(timestamp).toLocaleDateString(locale)
}

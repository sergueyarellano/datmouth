const bucko = require('./core')
const argv = require('minimist')(process.argv.slice(2))

async function init () {
  const aye = await bucko(argv.t, argv.l)

  aye.readTail(function (tail) {
    console.log(tail.value.text)
  })

  process.stdin.on('data', function (line) {
    aye.publish(line.toString())
  })
}

init()

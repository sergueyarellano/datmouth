#!/usr/bin/env node
const argv = require('minimist')(process.argv.slice(2))
const client = require('./client')
const topic = argv._[0]

if (argv.v || argv.version) {
  console.log(require('./package.json').version)
  process.exit(0)
}

if (topic) client(topic)
else {
  console.log('Provide a topic please')
  process.exit(1)
}

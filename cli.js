#!/usr/bin/env node
const argv = require('minimist')(process.argv.slice(2))
const client = require('./client')
const topic = argv._[0]
const localRef = argv.l

if (topic) client(topic, localRef)
else {
  console.log('Provide a topic please')
  process.exit(1)
}

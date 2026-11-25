#!/usr/bin/env node
import minimist from 'minimist'
import { createRequire } from 'node:module'
import client from './client.js'

const argv = minimist(process.argv.slice(2))
const topic = argv._[0]

if (argv.v || argv.version) {
  console.log(createRequire(import.meta.url)('./package.json').version)
  process.exit(0)
}

const bootstrap = argv.bootstrap
  ? String(argv.bootstrap).split(',').map(hp => {
    const [host, port] = hp.split(':')
    return { host, port: Number(port) }
  })
  : undefined

if (topic) client(String(topic), { swarmOpts: bootstrap && { bootstrap } })
else {
  console.log('Provide a topic please')
  process.exit(1)
}

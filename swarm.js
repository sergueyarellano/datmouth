const Hyperswarm = require('hyperswarm')
const crypto = require('crypto')
const pump = require('pump')
const chalk = require('chalk')

module.exports = swarm

function swarm (core, topic, updateTimeOfLastConnection) {
  const swarm = new Hyperswarm()
  const topicDiscoveryKey = crypto.createHash('sha256').update(topic).digest()

  swarm.join(topicDiscoveryKey)

  swarm.on('connection', async function (socket, details) {
    details.peer && console.log(`📡 ${chalk.green('+1')} peer`, details.peer.local ? '(LAN)' : '(WAN)')
    // We update time of last connection to avoid showing old/offline messages
    // The client will take this as a threshold to display or not new replicated messages
    updateTimeOfLastConnection(Date.now())
    pump(socket, core.replicate(details.client, { live: true }), socket)
  })

  swarm.on('disconnection', function (socket, details) {
    details.peer && console.log(`📡 ${chalk.red('-1')} peer`, details.peer.local ? '(LAN)' : '(WAN)')
  })

  return swarm
}

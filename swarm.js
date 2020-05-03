const network = require('hyperswarm')
const crypto = require('crypto')
const pump = require('pump')

module.exports = swarm

function swarm (core, topic, updateTimeOfLastConnection) {
  const swarm = network()
  const topicDiscoveryKey = crypto.createHash('sha256').update(topic).digest()

  swarm.join(topicDiscoveryKey, {
    lookup: true, // find and connect to peers.
    announce: true // optional: announce self as a connection target.
  })

  swarm.on('connection', function (socket, details) {
    // We update time of last connection to avoid showing old/offline messages
    // The client will take this as a threshold to display or not new replicated messages
    updateTimeOfLastConnection(Date.now())
    pump(socket, core.replicate(details.client, { live: true }), socket)
  })

  return swarm
}

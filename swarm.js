const network = require('hyperswarm')
const crypto = require('crypto')
const pump = require('pump')
const utils = require('./utils')

module.exports = swarm

function swarm (core, topic, updateTimeOfLastConnection) {
  const swarm = network()
  const topicDiscoveryKey = crypto.createHash('sha256').update(topic).digest()
  let peers = []
  const user = {
    port: null,
    localIP: null,
    publicIP: null
  };
  // get user Public address once
  (async () => { user.publicIP = await utils.getPublicIP() })()

  swarm.join(topicDiscoveryKey, {
    lookup: true, // find and connect to peers.
    announce: true // optional: announce self as a connection target.
  })

  swarm.on('connection', async function (socket, details) {
    // We update time of last connection to avoid showing old/offline messages
    // The client will take this as a threshold to display or not new replicated messages
    if (details.peer) {
      /* Update connected peers
      details.peer fields
      - port
      - host
      - local
      */
      peers = peers.concat(details.peer)
    } else {
      // Update user address info
      const myAddress = socket.address()
      user.localIP = utils.getIPV4FromIPV6(myAddress.address)
      user.port = myAddress.port
    }
    updateTimeOfLastConnection(Date.now())
    pump(socket, core.replicate(details.client, { live: true }), socket)
  })

  swarm.on('disconnection', function (socket, details) {
    // TODO: refactor
    if (details.peer) {
      peers = peers.filter(peer => {
        if (details.peer.local) {
          return peer.port !== details.peer.port
        } else {
          return peer.host !== details.peer.host && peer.port !== details.peer.port
        }
      })
    }
  })

  return {
    swarm,
    getActivePeers: () => peers,
    getUser: () => user
  }
}

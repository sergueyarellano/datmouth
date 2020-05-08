const kappacore = require('kappa-core')
const memdb = require('memdb')
const path = require('path')
const views = require('./views')
const swarm = require('./swarm')
const { createNickname, assignColor, getTimestamp, slug } = require('./utils')

module.exports = createDATMouth

async function createDATMouth (topicName, suffix = '') {
  // for local testing suffix help us in differentiating between client instances,
  // we can pass a 1, 2, 3 etc
  const topic = slug(topicName)
  const databasePath = path.resolve(__dirname, `./hc-${topic}${suffix}`)
  const kappa = kappacore(databasePath, { valueEncoding: 'json' })

  /* VIEWS */
  const db = memdb()
  kappa.use('chat', views.createMessagesView(db))

  /* CREATE LOCAL WRITER */
  const feed = await getFeed(kappa)
  const head = await getHead(feed()).catch(err => ({})) // eslint-disable-line

  /* ASSIGN NICKNAME */
  let nickname = head.nickname || createNickname()
  let color = head.color || assignColor()

  /* TRACK TIME OF NEWER CONNECTIONS  */
  let timeOfLastConnection = Date.now() // eslint-disable-line
  const updateTimeOfLastConnection = (timeMS = Date.now()) => { timeOfLastConnection = timeMS }

  /* JOIN SWARM AND DISCOVER PEERS */
  // Important to join the swarm once the local writer is initialized
  const network = swarm(kappa, topic, updateTimeOfLastConnection)
  const peerMaps = {}

  return {
    publish: (message) => publish({ message, feed: feed(), nickname, color, address: network.getUser() }),
    updateNickname: (newNickname) => { nickname = newNickname },
    getNickname: () => nickname,
    readLast: (size) => readLast(size, kappa),
    listenTail: (fn) => tail(kappa, fn),
    getTimeOfLastConnection: () => timeOfLastConnection,
    setColor: (code) => { color = code },
    getColor: () => color,
    getActiveConnections: () => {
      const user = network.getUser()
      const activePeers = network.getActivePeers()

      // TODO: refactor
      return activePeers
        .map(peer => {
          const mappedPeer = {}
          mappedPeer.local = peer.local
          mappedPeer.port = peer.port
          mappedPeer.host = peer.host
          if (peer.local) {
            mappedPeer.nickname = peerMaps[user.publicIP]
              ? peerMaps[user.publicIP].reduce((acc, peerMap) => {
                // From user perspective, we could have different hosts in our network
                if (peerMap.port === peer.port && peerMap.localIP === peer.host) return peerMap.nickname
                return acc
              }, '')
              : ''
          } else {
            mappedPeer.nickname = peerMaps[peer.host]
              ? peerMaps[peer.host].reduce((acc, peerMap) => {
                // From user perspective, their IP will be the same, just the port will change
                // if the peer has other peers in his network
                if (peerMap.port === peer.port) return peerMap.nickname
                return acc
              }, '')
              : ''
          }

          return mappedPeer
        })
    },
    setPeerMap: ({ port, publicIP, localIP, nickname }) => {
      peerMaps[publicIP] = peerMaps[publicIP] || []
      // TODO: refactor
      if (peerMaps[publicIP].length === 0) {
        // if there is not a peer already tracked with the publicIP we receive, just push it
        peerMaps[publicIP].length || peerMaps[publicIP].push({ port, localIP, nickname })
      } else if (peerMaps[publicIP].length > 0) {
        // This could be the same user or somebody else in its local network
        /* Find if the user exists and update it */
        const peerMapExists = !!peerMaps[publicIP].find(peerMap => peerMap.port === port)

        if (peerMapExists) {
          /* Update peerMap */
          peerMaps[publicIP] = peerMaps[publicIP].map(peerMap => {
            if (peerMap.port === port) {
              peerMap.nickname = nickname
            }
            return peerMap
          })
        } else {
          peerMaps[publicIP].push({ port, localIP, nickname })
        }
      }
    }
  }
}

function readLast (size, kappa) {
  return new Promise((resolve, reject) => {
    kappa.api.chat.read({ reverse: true, limit: Number(size) }, function (err, msgs) {
      if (err) reject(err)
      resolve(msgs.reverse())
    })
  })
}

function getHead (feed) {
  return new Promise((resolve, reject) => {
    feed.head((err, data) => {
      if (err) reject(err)
      resolve(data)
    })
  })
}

function tail (kappa, fn) {
  // listens to hypercore changes
  kappa.api.chat.tail(1, (data) => fn(data[0]))
}

function publish ({ message, feed, nickname, color, address }) {
  return new Promise((resolve, reject) => {
    feed.append({
      type: 'chat',
      nickname,
      text: message,
      address,
      color,
      timestamp: getTimestamp()
    }, function (err) {
      if (err) reject(err)
      resolve(message)
    })
  })
}

async function getFeed (kappa) {
  const feed = await createWriter(kappa)
  return () => feed
}

function createWriter (kappa) {
  return new Promise((resolve, reject) => {
    kappa.ready(function () {
      kappa.writer('local', (err, feed) => {
        if (err) reject(err)
        resolve(feed)
      })
    })
  })
}

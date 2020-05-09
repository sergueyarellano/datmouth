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

  return {
    publish: (message) => publish({ message, feed: feed(), nickname, color, address: network.getUser() }),
    updateNickname: (newNickname) => { nickname = newNickname },
    getNickname: () => nickname,
    readLast: (size) => readLast(size, kappa),
    listenTail: (fn) => tail(kappa, fn),
    getTimeOfLastConnection: () => timeOfLastConnection,
    setColor: (code) => { color = code },
    getColor: () => color,
    getActiveConnections: () => { return network.connections.size / 2 }
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

const kappacore = require('kappa-core')
const memdb = require('memdb')
const tempy = require('tempy')
const list = require('kappa-view-list')
const views = require('./views')

const swarm = require('./swarm')
const { createNickname, assignColor, getTimestamp, slug } = require('./utils')

module.exports = createDATMouth

async function createDATMouth (topicName, ram) {
  const topic = slug(topicName)
  const databasePath = ram || tempy.directory()
  const kappa = kappacore(databasePath, { valueEncoding: 'json' })

  /* VIEWS */
  const db = memdb()
  kappa.use('chat', list(db, views.filterMessageView))

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
    publish: (message) => publish({ message, feed: feed(), nickname, color }),
    updateNickname: (newNickname) => { nickname = newNickname },
    getNickname: () => nickname,
    readLast: (size) => readLast(size, kappa),
    listenTail: (fn) => tail(kappa, fn),
    getTimeOfLastConnection: () => timeOfLastConnection,
    setColor: (code) => { color = code },
    getColor: () => color,
    getActiveConnections: () => { return network.connections.size },
    disconnect: () => network.destroy()
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

function publish ({ message, feed, nickname, color }) {
  const formattedMsg = {
    type: 'chat',
    nickname,
    text: message,
    color,
    timestamp: getTimestamp()
  }
  return new Promise((resolve, reject) => {
    feed.append(formattedMsg, function (err) {
      if (err) reject(err)
      resolve(formattedMsg)
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

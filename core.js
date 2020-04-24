const kappacore = require('kappa-core')
const views = require('./views')
const memdb = require('memdb')
const swarm = require('./swarm')
const cuid = require('cuid')
const path = require('path')

module.exports = createDATMouth

async function createDATMouth (topicName, localRef = '') {
  // for local testing localRef help us in differentiating between clients,
  // we can pass a 1, 2, 3 etc
  const topic = slug(topicName)
  const databasePath = path.resolve(__dirname, `./hc-${topic}${localRef}`)
  const kappa = kappacore(databasePath, { valueEncoding: 'json' })

  const db = memdb()
  kappa.use('chat', views.createMessagesView(db))

  const feed = await getFeed(kappa)
  const head = await getHead(feed()).catch(err => ({})) // eslint-disable-line

  let nickname = head.nickname || createNickname()
  // Important to join the swarm once the local writer is initialized
  swarm(kappa, topic)

  return {
    publish: (message) => publish(message, feed(), nickname),
    updateNickname: (newNickname) => { nickname = newNickname },
    getNickname: () => nickname,
    readLast: (size) => readLast(size, kappa),
    listenTail: (fn) => tail(kappa, fn),
    slug,
    getTimestamp
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

function publish (message, feed, nickname) {
  return new Promise((resolve, reject) => {
    feed.append({
      type: 'chat',
      nickname,
      text: message,
      timestamp: getTimestamp()
    }, function (err) {
      if (err) reject(err)
      resolve(message)
    })
  })
}

function getTimestamp (date = Date.now()) {
  return new Date().toISOString()
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

function createNickname () {
  return cuid().slice(-7)
}

function slug (s) {
  return s.trim().toLocaleLowerCase().replace(/\s/g, '-')
}

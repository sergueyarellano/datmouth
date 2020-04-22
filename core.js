const kappacore = require('kappa-core')
const views = require('./views')
const memdb = require('memdb')
const swarm = require('./swarm')
const cuid = require('cuid')

module.exports = createBucko

async function createBucko (topicName, localRef = '') {
  // for local testing localRef help us in differentiating between clients,
  // we can pass a 1, 2, 3 etc
  const topic = slug(topicName)
  const databasePath = `./bucko-${topic}${localRef}`
  const core = kappacore(databasePath, { valueEncoding: 'json' })

  const db = memdb()
  core.use('chat', views.createMessagesView(db))

  const feed = await getFeed(core)
  let nickname = createNickname()
  // Important to join the swarm once the local writer is initialized
  swarm(core, topic)

  return {
    publish: (message) => publish(message, feed(), nickname),
    addNickname: (newNickname) => { nickname = newNickname },
    getNickname: () => nickname,
    readTail: (fn) => tail(core, fn)
  }
}

function tail (core, fn) {
  core.api.chat.tail(1, (data) => fn(data[0]))
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

function getTimestamp () {
  return new Date().toISOString()
}
async function getFeed (core) {
  const feed = await createWriter(core)
  return () => feed
}

function createWriter (core) {
  return new Promise((resolve, reject) => {
    core.ready(function () {
      core.writer('local', (err, feed) => {
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

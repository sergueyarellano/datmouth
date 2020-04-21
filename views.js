const list = require('kappa-view-list')

module.exports = {
  createMessagesView
}

function createMessagesView (db) {
  // it is a timestamp view
  return list(db, function (msg, next) {
    if (!msg.value.timestamp) return next()
    if (msg.value.type === 'chat') next(null, [msg.value.timestamp])
  })
}

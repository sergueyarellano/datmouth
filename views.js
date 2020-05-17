module.exports = {
  filterMessageView
}

function filterMessageView (msg, next) {
  const isoRE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
  return (msg.value.timestamp && isoRE.test(msg.value.timestamp) && msg.value.type === 'chat')
    ? next(null, [msg.value.timestamp])
    : next(null)
}

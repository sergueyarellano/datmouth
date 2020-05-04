module.exports = {
  aggregateDateLines
}

function aggregateDateLines (messages) {
  return messages.reduce((acc, message) => {
    const lastIndex = acc.length - 1
    const previousMessage = acc[lastIndex]
    const datePrevious = previousMessage && new Date(previousMessage.value.timestamp).toDateString()
    const dateCurrent = new Date(message.value.timestamp).toDateString()

    return (!previousMessage || datePrevious !== dateCurrent)
      ? acc
        .concat({
          value: {
            type: 'daychange',
            text: dateCurrent
          }
        })
        .concat(message)
      : acc.concat(message)
  }, [])
}

const moment = require('moment')

const formatMessage = (username, message) => {
  return {
    username,
    text: message,
    time: moment().format('h:mm a'),
  }
}

module.exports = formatMessage

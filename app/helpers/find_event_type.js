const { Event } = require('../models')

const findEventType = async text => {
  const supportedEventTypes = await Event.allTypes()
  const matchedEventType = supportedEventTypes.find(event => text.includes(`:${event.type}:`))

  return matchedEventType
}

module.exports = findEventType

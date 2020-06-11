const Event = knex => ({
  async findOrCreate(type, userId) {
    let eventObject = { type }
    let [ event ] = await knex('event').where(eventObject)

    if (!event) {
      eventObject = { type, created_by: userId }
      ;[ event ] = await knex('event').insert(eventObject, ['id'])
      event = { ...event, _new_entry: true }
    }
    return event
  },
  async allTypes() {
   const allTypes = await knex.select('id', 'type').from('event')

    return allTypes
  },
})

module.exports = Event;

const Event = knex => ({
  async findOrCreate(type) {
    const eventObject = { type }
    let [ event ] = await knex('event').where(eventObject)

    if (!event) {
      [ event ] = await knex('event').insert(eventObject, ['id'])
    }
    return event
  },
  async allTypes() {
   const allTypes = await knex.select('id', 'type').from('event')

    return allTypes
  },
})

module.exports = Event;

const config = require('../../knexfile')

const ENV = process.env.NODE_ENV === 'production' ? 'production' : 'development'
const knex = require('knex')(config[ENV])

const User = require('./user')(knex)
const Event = require('./event')(knex)

const UserEvent = {
  async create({ to, from, type, amount }) {
    // todo: transaction
    const { id: to_id } = await User.findOrCreate(to)
    const { id: from_id } = await User.findOrCreate(from)
    const { id: event_id } = await Event.findOrCreate(type)

    const userEvent = await knex('user_event').insert({
      from_id,
      to_id,
      event_id,
      amount,
    })
    return userEvent
  },
  async getLeaders(type) {
    if (type !== 'recipients' && type !== 'givers') return []

    const column = type === 'recipients' ? 'to_id' : 'from_id'

    const { rows } = await knex.raw(`SELECT u.user_name, sums.sum from "user" as u
    join (SELECT SUM(user_event.amount), user_event.${column} from user_event GROUP BY user_event.${column}) as sums
    on sums.${column}=u.id ORDER BY sum DESC;
    `)

    return rows
  },
}

module.exports = UserEvent;
module.exports.User = User

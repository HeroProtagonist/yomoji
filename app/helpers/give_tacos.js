const UserEvent = require('../models')
const { User } = UserEvent

const giveTacos = async ({ count, recipients, user }) => {
    // TODO Wrap this in a transaction
    const limit = await User.getLimit(user)

    if (!limit) return {}

    if (recipients.length > 1 && limit < count * recipients.length) {
        // If I don't have enough for multi-recipients, just bail
        return {given: 0, remaining: limit}
    }

    // Allows truncation if I've given too many away

    const allowedCount = Math.min(limit, count)
    const totalGiven = recipients.length * allowedCount

    const userEventPromises = recipients.map(recipient => {
        return UserEvent.create({
            to: recipient,
            from: user,
            type: 'taco',
            amount: allowedCount,
        })
    })

    await Promise.all(userEventPromises)
    await User.decrement(user, totalGiven)

    const remaining = limit - totalGiven

    return {
        given: allowedCount,
        remaining,
    }
}

module.exports = giveTacos

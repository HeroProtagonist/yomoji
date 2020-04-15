const fetch = require('node-fetch')

const getUsersInfo = async userName => {
    const res = await fetch(`https://slack.com/api/users.info?user=${userName}`, {
        headers: {
            Authorization: `Bearer ${process.env.BOT_TOKEN}`
        },
    })
    const { user } = await res.json()
    return user
}

module.exports = getUsersInfo

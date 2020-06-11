const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const UserEvent = require('./models')
const { postMessage } = require('./slack')
const fetch = require('node-fetch')

const {
    giveType,
    createLeaderboard,
    parseBlocks,
    messageParticipants,
    findEventType,
} = require('./helpers')

const { User, Event } = UserEvent

const app = express()

const logger = process.env.NODE_ENV === 'production' ? 'tiny' : 'dev'
app.use(morgan(logger))

app.use(bodyParser.json())

app.post('/', async (req, res) => {
    const { challenge, event } = req.body

    if (challenge) {
        return res.send({
            challenge
        })
    } else {
        res.sendStatus(200)
    }

    // user mentions bot handle this
    if (event.type === 'app_mention' && event.subtype !== 'bot_message') {
        let botMessage = 'I am a bot'

        if (event.text && event.text.includes('leaderboard')) {
            try {
                botMessage = 'TODO: PRs welcome - https://github.com/HeroProtagonist/yomoji' //await createLeaderboard()
            } catch (e) {
                console.log('Error creating leaderboard: ', e)
            }

        }

        const payloadType = Array.isArray(botMessage) ? 'blocks' : 'text'

        return postMessage({
            [payloadType]: botMessage,
            channel: event.channel,
            link_names: false,
        }).catch(console.log)
    }

    if (event.type === 'message' && event.subtype !== 'bot_message') {
        // if edit, previous message event.message
        const { user } = event

        if (!event.text) {
            console.log('*****')
            console.log('No event text: ', JSON.stringify({ event }), Date.now())
            console.log('*****')
        }

        const matchedEventType = await findEventType(event.text)
        if (!matchedEventType) return
        if (event.blocks === undefined) return

        const results = parseBlocks(event.blocks, matchedEventType)

        if (!results) return

        const { recipients, count } = results

        let allowedRecipients = [...recipients].filter(async (recipient) => {
            try {
                var { is_bot } = await User.findOrCreate(recipient)
            } catch (e) {
                console.log(`Error finding or creating user ${recipient}: `, e)
                return false;
            }

            return !(user === recipient || is_bot)
        })

        if (!allowedRecipients.length) return

        try {
            var { given, remaining } = await giveType({ recipients: allowedRecipients, count, user, type: matchedEventType.type })
        } catch (e) {
            console.log(`Error giving emoji ${JSON.stringify({ allowedRecipients, count, user, type: matchedEventType.type })}: `, e)
        }

        if (!given) {
            const message = !remaining ? "You are out of emojis for today" : `Unable to give that many emojis. ${remaining} left`

            return postMessage({
                text: message,
                channel: user
            }).catch(console.log)
        }

        return messageParticipants({
            recipients: allowedRecipients,
            remaining,
            given,
            user,
        }).catch(console.log)
    }
})

// slash commands
app.use(bodyParser.urlencoded({ extended: true }))
app.post('/add_emoji', async (req, res) => {
    const { text, user_id } = req.body
    const firstEmojiMatch = text.match(/:(?<emojiType>[^\s]+):/)
    const initialReply = firstEmojiMatch ? 'Working on it..' : 'No emoji sent'

    res.send(initialReply)

    if (!firstEmojiMatch) return
    const { groups: { emojiType } } = firstEmojiMatch

    const { _new_entry } = await Event.findOrCreate(emojiType, user_id)

    const message = {
        text: _new_entry ? `Created entry for :${emojiType}:` : `:${emojiType}: Already exists!`
    }

    return fetch(req.body.response_url, {
        method: 'post',
        body: JSON.stringify(message),
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        },
    })
})

app.post('/list_emojis', async (req, res) => {
    res.send('Working on it..')

    const allTypes = await Event.allTypes()
    const typeArray = allTypes.map(t => `:${t.type}:`)
    const message = {
        text: `Here you go: \n I can send these emojis: ${typeArray}`
    }

    return fetch(req.body.response_url, {
        method: 'post',
        body: JSON.stringify(message),
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        },
    })
})

module.exports = app

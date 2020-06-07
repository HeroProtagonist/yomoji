const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const UserEvent = require('./models')
const { postMessage } = require('./slack')

const {
    giveType,
    createLeaderboard,
    parseBlocks,
    messageParticipants,
    findEventType,
} = require('./helpers')

const { User } = UserEvent

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

        if (event.text.includes('leaderboard')) {
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
            console.log(`Error giving tacos to ${JSON.stringify({ allowedRecipients, count, user, type: matchedEventType.type })}: `, e)
        }

        if (!given) {
            const message = !remaining ? "You are out of tacos for today" : `Unable to give that many tacos. ${remaining} left`

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

module.exports = app

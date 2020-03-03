const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const UserEvent = require('./models')
const { postMessage } = require('./slack')

const {
    giveTacos,
    createLeaderboard,
    parseBlocks,
    messageParticipants,
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

        if (!event.text.includes(':taco:')) return

        const results = parseBlocks(event.blocks)

        if (!results) return

        const { recipients, count } = results

        let allowedRecipients = recipients.filter(() => {        
            try {
                var { is_bot } = await User.findOrCreate(recipient)
            } catch (e) {
                console.log(`Error finding or creating user ${recipient}: `, e)
                return false;
            }
    
            return !(user === recipient || is_bot)
        })

        try {
            var { given, remaining } = await giveTacos({ allowedRecipients, count, user })
        } catch (e) {
            console.log(`Error giving tacos to ${{ allowedRecipients, count, user }}: `, e)
        }

        if (!given) {
            const message = !remaining ? "You are out of tacos for today" : `Unable to give that many tacos. ${Remaining} left`

            return postMessage({
                text: message,
                channel: user
            }).catch(console.log)
        }

        return messageParticipants({
            allowedRecipients,
            remaining,
            given,
            user,
        }).catch(console.log)
    }
})

module.exports = app

const { postMessage } = require('../slack')

const messageParticipants = (params) => {
    return Promise.all([
        messageRecipient(params),
        messageUser(params),
    ])
}

const messageRecipient = ({ user, recipients, given }) => {
    const singularTacoMessages = [
        `<@${user}> told me to give you this:`,
    ];
    const pluralTacoMessages = [
        `<@${user}> told me to give you these:`,
        `Is it hot in here or is it that salsa on those tacos from <@${user}>?`
    ];
    const numberSpecificMessages = {
        2: [
            `Roses are red, violets are blue, you must really be killin' it, because <@${user}> sent you two!`
        ],
        3: [
            `Hope you're ready for a snack because <@${user}> just sent you three!`
        ],
        4: [
            `<@${user}> thinks you've knocked it out of the park and straight into a taco stand`,
        ],
        5: [
            `Hot diggity dog! <@${user}> thinks you're cooler than a box of frozen empanadas`,
            `Did it hurt? When you fell from heaven and landed on all the tacos you've been gifted by <@${user}>?`,
        ]
    };

    let messagePool = [];
    if (given === 1) messagePool = messagePool.concat(singularTacoMessages);
    if (given > 1) messagePool = messagePool.concat(pluralTacoMessages);
    if (numberSpecificMessages[given]) messagePool = messagePool.concat(numberSpecificMessages[given]);

    const message = messagePool[Math.floor(Math.random() * messagePool.length)];

    return recipients.map(async recipient => {
        await postMessage({
            text: message + ' ' + countTacos(given),
            channel: recipient
        })
    })
}

const messageUser = ({ user, recipients, given, remaining }) => {
    const users = recipients.map(recipient => {
        return `<@${recipient}>`
    }).join(", ")


    const message = `You gave ${given} tacos to ${users}. ${countTacos(given * recipients.length)}\n` +
    `You have ${remaining} left today.`

    return postMessage({
        text: message,
        channel: user
    })
}

const countTacos = count => {
    const tacos = [];
    for (let i = 0; i < count; i++) {
        tacos.push(':taco:');
    }
    return tacos.join(' ');
}

module.exports = messageParticipants

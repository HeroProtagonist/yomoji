const parseBlocks = ([ blocks ]) => {
    let nextblocks = blocks
    while (nextblocks.type !== 'rich_text_section') {
        nextblocks = nextblocks.elements[0]
    }

    const { elements } = nextblocks
    let recipients = new Set()

    const blockObj = elements.reduce((memo, curr) => {
        const { type, user_id, name } = curr

        if (type === 'user') {
            recipients.add(user_id)
        } else if (type === 'emoji' && name === 'taco') {
            memo.emoji = ++memo.emoji || 1
        }

        return memo
    }, {})

    if (!recipients.size) return null
    return {
        recipients,
        count: blockObj.emoji
    }
}

module.exports = parseBlocks

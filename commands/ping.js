module.exports = {
    data: {
        name: 'ping',
        description: 'Répond pong'
    },
    async execute(message, args) {
        await message.reply('Pong !');
    }
};
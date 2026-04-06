const fs = require('fs');

module.exports = {
    data: { name: 'addcoins', description: 'Ajouter des coins (admin)' },
    async execute(message, args) {
        if (!args[0] || isNaN(args[0])) return message.reply("Usage: !addcoins <montant>");
        const players = JSON.parse(fs.readFileSync('players.json'));
        const userId = message.author.id;

        if (!players[userId]) players[userId] = { coins: 0, xp: 0, level: 1, inventory: [], lastDaily: null };

        players[userId].coins += parseInt(args[0]);
        fs.writeFileSync('players.json', JSON.stringify(players, null, 2));

        message.reply(`✅ Tu as ajouté ${args[0]} coins à ton compte !`);
    }
};
const fs = require('fs');

module.exports = {
    data: { name: 'inventory', description: 'Voir ton inventaire' },
    async execute(message, args) {
        const players = JSON.parse(fs.readFileSync('players.json'));
        const userId = message.author.id;

        if (!players[userId]) {
            players[userId] = { coins: 0, xp: 0, level: 1, inventory: [], lastDaily: null };
            fs.writeFileSync('players.json', JSON.stringify(players, null, 2));
        }

        const inv = players[userId].inventory;
        message.reply(`🎒 Ton inventaire: ${inv.length ? inv.join(', ') : 'vide'}`);
    }
};
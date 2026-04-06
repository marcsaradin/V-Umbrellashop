const fs = require('fs');

module.exports = {
    data: { name: 'profile', description: 'Voir ton profil et stats' },
    async execute(message, args) {
        const players = JSON.parse(fs.readFileSync('players.json'));
        const userId = message.author.id;

        if (!players[userId]) {
            players[userId] = { coins: 0, xp: 0, level: 1, inventory: [], lastDaily: null };
            fs.writeFileSync('players.json', JSON.stringify(players, null, 2));
        }

        const p = players[userId];
        message.reply(`Profil de ${message.author.username} :
💰 Coins: ${p.coins}
⭐ XP: ${p.xp} | Niveau: ${p.level}
🎒 Inventaire: ${p.inventory.join(', ') || 'vide'}`);
    }
};
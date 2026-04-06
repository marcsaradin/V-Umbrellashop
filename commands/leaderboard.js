const fs = require('fs');

module.exports = {
    data: { name: 'leaderboard', description: 'Voir le classement' },
    async execute(message, args) {
        const players = JSON.parse(fs.readFileSync('players.json'));
        const sorted = Object.entries(players)
            .sort((a,b) => b[1].coins - a[1].coins)
            .slice(0,10);

        let lb = '🏆 Classement des coins:\n';
        sorted.forEach(([id, data], i) => {
            lb += `${i+1}. <@${id}> - ${data.coins} coins | Niveau ${data.level}\n`;
        });

        message.reply(lb);
    }
};
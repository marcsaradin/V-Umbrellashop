const fs = require('fs');
const COINS_FILE = './coins.json'; // Nouveau fichier pour le shop

module.exports = {
    data: { name: 'addcoins', description: 'Ajouter des coins (admin)' },
    async execute(message, args) {
        // Vérification du montant
        if (!args[0] || isNaN(args[0])) 
            return message.reply("Usage: !addcoins <montant>");

        // Lire le fichier coins.json ou créer vide
        let coins = {};
        if (fs.existsSync(COINS_FILE)) {
            coins = JSON.parse(fs.readFileSync(COINS_FILE));
        }

        const userId = message.author.id;

        if (!coins[userId]) coins[userId] = 0;

        coins[userId] += parseInt(args[0]);
        fs.writeFileSync(COINS_FILE, JSON.stringify(coins, null, 2));

        message.reply(`✅ Tu as ajouté ${args[0]} coins à ton compte !`);
    }
};
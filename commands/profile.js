const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

const FILE = './players.json';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Voir ton profil'),

    async execute(interaction) {
        const userId = interaction.user.id;
        const username = interaction.user.username;

        let players = {};

        // Charger les données
        if (fs.existsSync(FILE)) {
            players = JSON.parse(fs.readFileSync(FILE));
        }

        // Créer joueur si pas existant
        if (!players[userId]) {
            players[userId] = { ambre: 0, inventory: [] };
            fs.writeFileSync(FILE, JSON.stringify(players, null, 2));
        }

        const player = players[userId];

        // Format inventaire
        const inventory = player.inventory.length
            ? player.inventory.join(', ')
            : 'vide';

        // Réponse propre
        await interaction.reply({
            content:
`👤 **Profil de ${username}**

💰 **Ambres :** ${player.ambre}
🎒 **Inventaire :** ${inventory}`
        });
    }
};
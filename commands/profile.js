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
        if (fs.existsSync(FILE)) {
            players = JSON.parse(fs.readFileSync(FILE));
        }

        // Créer joueur si pas existant
        if (!players[userId]) {
            players[userId] = { ambre: 0, inventory: [] };
            fs.writeFileSync(FILE, JSON.stringify(players, null, 2));
        }

        const p = players[userId];

        await interaction.reply(
`👤 Profil de ${username}

💰 Ambres : ${p.ambre}
🎒 Inventaire : ${p.inventory.length ? p.inventory.join(', ') : 'vide'}`
        );
    }
};
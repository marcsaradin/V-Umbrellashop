const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

const FILE = './players.json';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('Voir ton inventaire'),

    async execute(interaction) {
        const userId = interaction.user.id;

        let players = {};
        if (fs.existsSync(FILE)) {
            players = JSON.parse(fs.readFileSync(FILE));
        }

        // Créer joueur si pas existant
        if (!players[userId]) {
            players[userId] = { ambre: 0, inventory: [] };
            fs.writeFileSync(FILE, JSON.stringify(players, null, 2));
        }

        const inv = players[userId].inventory;

        await interaction.reply(
            `🎒 Ton inventaire : ${inv.length ? inv.join(', ') : 'vide'}`
        );
    }
};
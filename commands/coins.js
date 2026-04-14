const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

const FILE = './players.json';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coins')
        .setDescription('Voir ton nombre d’ambres'),

    async execute(interaction) {
        const userId = interaction.user.id;

        let players = {};
        if (fs.existsSync(FILE)) {
            players = JSON.parse(fs.readFileSync(FILE));
        }

        if (!players[userId]) {
            players[userId] = { ambre: 0, inventory: [] };
        }

        await interaction.reply(`💰 Tu as ${players[userId].ambre} ambres`);
    }
};
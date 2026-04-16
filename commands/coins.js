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

        console.log("COINS CHECK:", userId, players[userId]); // debug

        if (!players[userId]) {
            return interaction.reply("💰 Tu as 0 ambres");
        }

        return interaction.reply(`💰 Tu as ${players[userId].ambre} ambres`);
    }
};
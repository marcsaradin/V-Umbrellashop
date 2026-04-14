const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '../users.json');

function loadDB() {
    if (!fs.existsSync(FILE)) return {};
    return JSON.parse(fs.readFileSync(FILE, 'utf8'));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coins')
        .setDescription('Voir ton nombre d’ambres'),

    async execute(interaction) {
        const userId = interaction.user.id;

        const users = loadDB();

        if (!users[userId]) {
            return interaction.reply("💰 Tu as 0 ambres");
        }

        return interaction.reply(`💰 Tu as ${users[userId].coins} ambres`);
    }
};
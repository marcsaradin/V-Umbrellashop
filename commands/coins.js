const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '../users.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coins')
        .setDescription('Voir ton nombre d’ambres'),

    async execute(interaction) {
        const userId = interaction.user.id;

        // 🔥 recharge le fichier à chaque commande
        let users = {};
        if (fs.existsSync(FILE)) {
            users = JSON.parse(fs.readFileSync(FILE, 'utf8'));
        }

        console.log("COINS CHECK:", userId, users[userId]); // DEBUG

        if (!users[userId]) {
            return interaction.reply("💰 Tu as 0 ambres");
        }

        return interaction.reply(`💰 Tu as ${users[userId].coins} ambres`);
    }
};
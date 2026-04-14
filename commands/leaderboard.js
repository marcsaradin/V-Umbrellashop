const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

const FILE = './players.json';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Voir le classement des ambres'),

    async execute(interaction) {
        let players = {};

        if (fs.existsSync(FILE)) {
            players = JSON.parse(fs.readFileSync(FILE));
        }

        // Trier par ambres
        const sorted = Object.entries(players)
            .sort((a, b) => b[1].ambre - a[1].ambre)
            .slice(0, 10);

        let lb = '🏆 Classement des ambres:\n\n';

        sorted.forEach(([id, data], i) => {
            lb += `${i + 1}. <@${id}> - ${data.ambre} ambres\n`;
        });

        if (sorted.length === 0) {
            lb = "❌ Aucun joueur dans le classement.";
        }

        await interaction.reply(lb);
    }
};
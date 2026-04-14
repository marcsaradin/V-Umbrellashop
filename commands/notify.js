const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('notify')
        .setDescription('Envoyer un message de test'),

    async execute(interaction) {
        await interaction.reply("🔔 Notification envoyée !");
    }
};
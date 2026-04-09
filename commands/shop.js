const { SlashCommandBuilder } = require('discord.js');

const shopURL = "https://marcsaradin.github.io/V-Umbrellashop/shop.html";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Ouvre le shop V-Umbrella'),

    async execute(interaction) {
        await interaction.reply({
            content: `🛒 **V-Umbrella Shop**\n🔗 Clique ici pour accéder au shop :\n${shopURL}`
        });
    }
};
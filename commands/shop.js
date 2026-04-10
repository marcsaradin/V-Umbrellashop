const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Ouvrir le shop'),

  async execute(interaction) {
    await interaction.reply({
      content: "🛒 https://v-umbrellashop-production.up.railway.app"
    });
  }
};
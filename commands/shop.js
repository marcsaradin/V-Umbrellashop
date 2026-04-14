const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Ouvrir le shop'),

  async execute(interaction) {
    await interaction.reply({
      content: "🛒 https://marcsaradin.github.io/V-Umbrellashop/"
    });
  }
};
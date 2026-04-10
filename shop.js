const { SlashCommandBuilder } = require('discord.js');

const shopURL = "https://v-umbrellashop-production.up.railway.app";

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Ouvre le shop V-Umbrella'),

  async execute(interaction) {
    await interaction.reply({
      content: `🛒 **V-Umbrella Shop**\n🔗 ${shopURL}`
    });
  }
};
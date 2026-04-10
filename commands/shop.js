const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Ouvrir le shop'),

  async execute(interaction) {
    try {
      await interaction.reply({
        content: "🛒 **V-Umbrella Shop**\nhttps://v-umbrellashop-production.up.railway.app"
      });
    } catch (error) {
      console.error("Erreur /shop :", error);

      if (!interaction.replied) {
        await interaction.reply({
          content: "❌ Erreur lors de l'ouverture du shop",
          ephemeral: true
        });
      }
    }
  }
};
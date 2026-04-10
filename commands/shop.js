module.exports = {
  data: {
    name: "shop",
    description: "Ouvrir le shop"
  },

  async execute(interaction) {
    try {
      await interaction.reply({
        content: "🛒 Ouvre le shop ici :\nhttps://v-umbrellashop-production.up.railway.app"
      });
    } catch (err) {
      console.log("Erreur shop:", err);
    }
  }
};
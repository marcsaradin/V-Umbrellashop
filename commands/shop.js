const shopURL = "https://v-umbrellashop-production.up.railway.app";

module.exports = {
  data: {
    name: "shop"
  },

  async execute(interaction) {
    await interaction.reply({
      content: `🛒 V-Umbrella Shop\n🔗 ${shopURL}`
    });
  }
};
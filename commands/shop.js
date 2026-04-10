module.exports = {
    data: {
        name: "shop"
    },

    async execute(interaction) {
        try {
            await interaction.deferReply();

            const url = "https://v-umbrellashop-production.up.railway.app";

            await interaction.editReply({
                content: `🛒 **V-Umbrella Shop**\n🔗 ${url}`
            });

        } catch (err) {
            console.log("SHOP ERROR:", err);

            if (!interaction.replied) {
                await interaction.reply({
                    content: "❌ Erreur shop",
                    ephemeral: true
                });
            }
        }
    }
};
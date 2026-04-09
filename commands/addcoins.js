const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');

const FILE = './players.json';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addcoins')
        .setDescription('Ajouter des ambres à ton compte (admin seulement)')
        .addIntegerOption(option =>
            option.setName('montant')
                .setDescription('Nombre d\'ambres à ajouter')
                .setRequired(true)
        ),

    async execute(interaction) {
        // Vérifier que l'utilisateur est admin
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: '❌ Tu n\'as pas la permission !', ephemeral: true });
        }

        const userId = interaction.user.id;
        const montant = interaction.options.getInteger('montant');

        // Charger players.json
        let players = {};
        if (fs.existsSync(FILE)) {
            players = JSON.parse(fs.readFileSync(FILE));
        }

        // Créer joueur si pas existant
        if (!players[userId]) {
            players[userId] = { ambre: 0, inventory: [] };
        }

        // Ajouter ambres
        players[userId].ambre += montant;

        // Sauvegarder
        fs.writeFileSync(FILE, JSON.stringify(players, null, 2));

        await interaction.reply(`✅ Tu as ajouté ${montant} ambres à ton compte !`);
    }
};
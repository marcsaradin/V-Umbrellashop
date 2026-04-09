const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');

const FILE = './players.json';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addcoins')
        .setDescription('Ajouter des ambres à un joueur (admin seulement)')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Joueur à payer')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('montant')
                .setDescription('Nombre d\'ambres à ajouter')
                .setRequired(true)
        ),

    async execute(interaction) {

        // 🔐 check admin
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: "❌ Tu n'as pas la permission !",
                ephemeral: true
            });
        }

        const target = interaction.options.getUser('user');
        const montant = interaction.options.getInteger('montant');

        if (montant <= 0) {
            return interaction.reply({
                content: "❌ Montant invalide",
                ephemeral: true
            });
        }

        // load db
        let players = {};
        if (fs.existsSync(FILE)) {
            players = JSON.parse(fs.readFileSync(FILE, 'utf8'));
        }

        // create user if not exist
        if (!players[target.id]) {
            players[target.id] = { ambre: 0, inventory: [] };
        }

        // add coins
        players[target.id].ambre += montant;

        // save
        fs.writeFileSync(FILE, JSON.stringify(players, null, 2));

        await interaction.reply(
            `✅ ${montant} ambres ajoutés à <@${target.id}>`
        );
    }
};
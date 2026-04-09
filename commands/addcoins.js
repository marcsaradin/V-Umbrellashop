const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');

const FILE = './users.json';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addcoins')
        .setDescription('Ajouter des ambres à un joueur (admin)')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Joueur')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('montant')
                .setDescription('Montant')
                .setRequired(true)
        ),

    async execute(interaction) {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: "❌ Pas permission", ephemeral: true });
        }

        const target = interaction.options.getUser('user');
        const montant = interaction.options.getInteger('montant');

        if (montant <= 0) {
            return interaction.reply({ content: "❌ montant invalide", ephemeral: true });
        }

        let users = {};

        if (fs.existsSync(FILE)) {
            users = JSON.parse(fs.readFileSync(FILE, 'utf8'));
        }

        if (!users[target.id]) {
            users[target.id] = { coins: 500 };
        }

        users[target.id].coins += montant;

        fs.writeFileSync(FILE, JSON.stringify(users, null, 2));

        return interaction.reply(
            `✅ ${montant} ambres ajoutés à <@${target.id}>`
        );
    }
};
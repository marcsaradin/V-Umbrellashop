const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '../users.json');

function loadDB() {
    if (!fs.existsSync(FILE)) return {};
    return JSON.parse(fs.readFileSync(FILE, 'utf8'));
}

function saveDB(data) {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addcoins')
        .setDescription('Donner des ambres à un membre')
        .addUserOption(option =>
            option.setName('user').setDescription('Utilisateur').setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('amount').setDescription('Montant').setRequired(true)
        ),

    async execute(interaction) {

        // 🔒 ADMIN ONLY
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: "❌ Permission refusée",
                ephemeral: true
            });
        }

        const target = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');

        if (!target || amount <= 0) {
            return interaction.reply({
                content: "❌ Données invalides",
                ephemeral: true
            });
        }

        let users = loadDB();

        if (!users[target.id]) {
            users[target.id] = { coins: 0, inventory: [] };
        }

        users[target.id].coins += amount;

        saveDB(users);

        return interaction.reply(
            `✅ ${amount} ambres ajoutés à <@${target.id}>`
        );
    }
};
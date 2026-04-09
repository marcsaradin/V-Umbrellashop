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
            option
                .setName('user')
                .setDescription('Utilisateur')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('amount')
                .setDescription('Montant')
                .setRequired(true)
        ),

    async execute(interaction) {

        const target = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');

        // 🔥 FIX CRASH
        if (!target) {
            return interaction.reply({
                content: "❌ Aucun utilisateur sélectionné",
                ephemeral: true
            });
        }

        if (!amount || amount <= 0) {
            return interaction.reply({
                content: "❌ Montant invalide",
                ephemeral: true
            });
        }

        let users = loadDB();

        if (!users[target.id]) {
            users[target.id] = { coins: 500 };
        }

        users[target.id].coins += amount;

        saveDB(users);

        console.log(`💰 addcoins: ${target.id} +${amount}`);

        return interaction.reply(
            `✅ ${amount} ambres ajoutés à <@${target.id}>`
        );
    }
};
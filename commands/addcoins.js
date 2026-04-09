const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

// 🔥 chemin ABSOLU (IMPORTANT RAILWAY FIX)
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
        .setDescription('Give des ambres à un membre')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Utilisateur')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Montant')
                .setRequired(true)
        ),

    async execute(interaction) {

        console.log("🔥 addcoins utilisé");

        // 🔐 permission check
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: "❌ Tu n'as pas la permission",
                ephemeral: true
            });
        }

        const target = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');

        console.log("➡ target:", target.id, "amount:", amount);

        let users = loadDB();

        if (!users[target.id]) {
            users[target.id] = { coins: 500 };
        }

        users[target.id].coins += amount;

        saveDB(users);

        console.log("💾 DB updated");

        return interaction.reply(
            `✅ +${amount} ambres donnés à <@${target.id}>`
        );
    }
};
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
        .setDescription('Donner des ambres à un joueur')
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

        // 🔐 ADMIN ONLY
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: "❌ Pas la permission",
                ephemeral: true
            });
        }

        const target = interaction.options.getUser('user');
        const montant = interaction.options.getInteger('montant');

        let users = loadDB();

        if (!users[target.id]) {
            users[target.id] = { coins: 500 };
        }

        users[target.id].coins += montant;

        saveDB(users);

        console.log(`💰 ADDCOINS: ${target.id} +${montant}`);

        return interaction.reply(
            `✅ ${montant} ambres ajoutés à <@${target.id}>`
        );
    }
};
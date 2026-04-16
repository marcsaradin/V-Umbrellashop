const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

// 🔥 chemin propre (IMPORTANT)
const FILE = path.join(__dirname, '../users.json');

// 📂 charger DB
function loadUsers() {
    if (!fs.existsSync(FILE)) return {};
    return JSON.parse(fs.readFileSync(FILE, 'utf8'));
}

// 💾 sauvegarder DB
function saveUsers(data) {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addcoins')
        .setDescription('Donner des ambres à un joueur')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Utilisateur')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Montant d’ambres')
                .setRequired(true)
        ),

    async execute(interaction) {

        // 🔒 permission admin
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: "❌ Tu n'as pas la permission",
                ephemeral: true
            });
        }

        const target = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');

        // 🔥 sécurité
        if (!target || amount <= 0) {
            return interaction.reply({
                content: "❌ Données invalides",
                ephemeral: true
            });
        }

        let users = loadUsers();

        // 🔥 création user
        if (!users[target.id]) {
            users[target.id] = { ambre: 0, inventory: [] };
        }

        // 💰 ajout ambres
        users[target.id].ambre += amount;

        saveUsers(users);

        console.log(`💰 ADD AMBRE: ${target.id} -> ${users[target.id].ambre}`);

        return interaction.reply(
            `✅ ${amount} ambres ajoutés à <@${target.id}>`
        );
    }
};
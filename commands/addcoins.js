const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');

const FILE = './players.json';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addcoins')
        .setDescription('Ajouter des ambres')
        .addUserOption(option =>
            option.setName('user').setDescription('Utilisateur').setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('amount').setDescription('Montant').setRequired(true)
        ),

    async execute(interaction) {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: "❌ Pas la permission",
                ephemeral: true
            });
        }

        const target = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');

        let players = {};

        if (fs.existsSync(FILE)) {
            players = JSON.parse(fs.readFileSync(FILE));
        }

        if (!players[target.id]) {
            players[target.id] = { ambre: 0, inventory: [] };
        }

        players[target.id].ambre += amount;

        fs.writeFileSync(FILE, JSON.stringify(players, null, 2));

        console.log("ADD AMBRE:", target.id, players[target.id]);

        await interaction.reply(`✅ ${amount} ambres ajoutés à <@${target.id}>`);
    }
};
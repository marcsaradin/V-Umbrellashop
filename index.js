require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits } = require('discord.js');

// 🌐 Serveur web (pour Railway 24/7)
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Bot en ligne !');
});

app.listen(PORT, () => {
    console.log(`🌐 Serveur lancé sur le port ${PORT}`);
});

// 🤖 Création du bot
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// 📂 Charger les commandes
client.commands = new Map();

const commandsPath = path.join(__dirname, 'commands');

if (!fs.existsSync(commandsPath)) {
    console.log("❌ Dossier commands introuvable !");
} else {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        try {
            const command = require(`./commands/${file}`);

            if (!command.data || !command.data.name) {
                console.log(`❌ Commande invalide: ${file}`);
                continue;
            }

            client.commands.set(command.data.name, command);
            console.log(`✅ Commande chargée: ${command.data.name}`);
        } catch (err) {
            console.log(`❌ Erreur dans ${file}`);
            console.error(err);
        }
    }
}

// ⚡ Quand le bot est prêt
client.once('clientReady', () => {
    console.log(`🤖 Connecté en tant que ${client.user.tag}`);
});

// 🎮 Gestion des slash commands
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);

        if (!interaction.replied) {
            await interaction.reply({
                content: '❌ Une erreur est survenue',
                ephemeral: true
            });
        }
    }
});

// 🚀 Connexion
client.login(process.env.TOKEN);
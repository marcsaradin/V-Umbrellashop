require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();
app.use(express.json());

// 🔥 IMPORTANT → permet d'afficher le HTML
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

// 🔥 PAGE PRINCIPALE = SHOP
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'shop.html'));
});

// =====================
// 💰 API SHOP
// =====================

let users = {};

app.get('/balance/:id', (req, res) => {
    const id = req.params.id;

    if (!users[id]) users[id] = { coins: 500 };

    res.json({ coins: users[id].coins });
});

app.post('/buy', (req, res) => {
    const { userId, item, price } = req.body;

    if (!userId || !item || !price) {
        return res.json({ error: "Missing data" });
    }

    if (!users[userId]) users[userId] = { coins: 500 };

    if (users[userId].coins < price) {
        return res.json({ error: "Pas assez d'ambre" });
    }

    users[userId].coins -= price;

    res.json({
        success: true,
        item,
        newBalance: users[userId].coins
    });
});

// =====================
// 🤖 BOT DISCORD
// =====================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
});

client.commands = new Map();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if (command.data && command.data.name) {
        client.commands.set(command.data.name, command);
        console.log(`✅ Commande chargée: ${command.data.name}`);
    }
}

// READY
client.once('clientReady', () => {
    console.log("🤖 Bot connecté");
    console.log(`🤖 Connecté en tant que ${client.user.tag}`);
});

// COMMANDES
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    await command.execute(interaction);
});

// START SERVER
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Serveur lancé sur ${PORT}`);
});

// LOGIN
client.login(process.env.TOKEN);
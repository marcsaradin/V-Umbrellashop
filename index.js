require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();
app.use(cors());
app.use(express.json());

// 🔥 sert les fichiers (index.html)
app.use(express.static(__dirname));

const PORT = process.env.PORT || 8080;

// =====================
// 💾 STOCKAGE
// =====================
const FILE = './users.json';
let users = {};

if (fs.existsSync(FILE)) {
    users = JSON.parse(fs.readFileSync(FILE));
}

function saveUsers() {
    fs.writeFileSync(FILE, JSON.stringify(users, null, 2));
}

// =====================
// 🤖 BOT DISCORD
// =====================
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// =====================
// 📂 COMMANDES
// =====================
client.commands = new Map();

const commandFiles = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    if (!command.data || !command.data.name) continue;

    client.commands.set(command.data.name, command);
}

// =====================
// READY
// =====================
client.once('clientReady', () => {
    console.log(`🤖 Connecté en tant que ${client.user.tag}`);
});

// =====================
// COMMANDES
// =====================
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (err) {
        console.error(err);
    }
});

// =====================
// API
// =====================

// 💰 balance
app.get('/balance/:id', (req, res) => {
    const id = req.params.id;

    if (!users[id]) {
        users[id] = { coins: 500, inventory: [] };
        saveUsers();
    }

    res.json({ coins: users[id].coins });
});

// 🛒 achat
app.post('/buy', async (req, res) => {
    const { userId, item, price } = req.body;

    if (!users[userId]) {
        users[userId] = { coins: 500, inventory: [] };
    }

    if (users[userId].coins < price) {
        return res.json({ error: "Pas assez d'ambres" });
    }

    users[userId].coins -= price;
    users[userId].inventory.push(item);

    saveUsers();

    // log discord
    try {
        const channel = await client.channels.fetch(process.env.SHOP_CHANNEL_ID).catch(() => null);
        if (channel) {
            channel.send(`🛒 <@${userId}> a acheté **${item}**`);
        }
    } catch {}

    res.json({
        item,
        newBalance: users[userId].coins
    });
});

// =====================
// START
// =====================
app.listen(PORT, '0.0.0.0', () => {
    console.log("🌐 Serveur lancé");
});

client.login(process.env.TOKEN);
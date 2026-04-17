require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const PORT = process.env.PORT || 8080;

// =====================
// 💾 DB
// =====================
const FILE = path.join(__dirname, 'users.json');

function loadUsers() {
    if (!fs.existsSync(FILE)) return {};
    return JSON.parse(fs.readFileSync(FILE, 'utf8'));
}

function saveUsers(data) {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

// =====================
// 🤖 BOT
// =====================
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('clientReady', () => {
    console.log(`🤖 Connecté en tant que ${client.user.tag}`);
});

// =====================
// 🌐 SITE
// =====================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// =====================
// 💰 BALANCE
// =====================
app.get('/balance/:id', (req, res) => {

    const users = loadUsers();
    const id = req.params.id;

    if (!users[id]) {
        users[id] = { ambre: 0, inventory: [] };
        saveUsers(users);
    }

    res.json({ ambre: users[id].ambre });
});

// =====================
// 🛒 ACHAT
// =====================
app.post('/buy', async (req, res) => {

    const users = loadUsers();
    const { userId, item, price } = req.body;

    if (!users[userId]) {
        users[userId] = { ambre: 0, inventory: [] };
    }

    if (users[userId].ambre < price) {
        return res.json({ error: "❌ Pas assez d'ambres" });
    }

    users[userId].ambre -= price;
    users[userId].inventory.push(item);

    saveUsers(users);

    console.log("🛒 ACHAT:", userId, item);

    // 🔥 MESSAGE DISCORD (FIX)
    try {
        const channelId = process.env.SHOP_CHANNEL_ID;

        console.log("CHANNEL ID:", channelId);

        const channel = await client.channels.fetch(channelId);

        if (!channel) {
            console.log("❌ Channel introuvable");
        } else {
            await channel.send(
                `🛒 **Nouvel achat !**\n` +
                `👤 <@${userId}>\n` +
                `📦 ${item}\n` +
                `💰 ${price} ambres\n` +
                `💳 Solde : ${users[userId].ambre}`
            );

            console.log("✅ Message envoyé Discord");
        }

    } catch (err) {
        console.log("❌ ERREUR DISCORD:", err);
    }

    res.json({
        item,
        newBalance: users[userId].ambre
    });
});

// =====================
// 🚀 START
// =====================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Serveur lancé sur ${PORT}`);
});

client.login(process.env.TOKEN);
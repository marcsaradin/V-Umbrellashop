require('dotenv').config();

const express = require('express');
const path = require('path');
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();
app.use(express.json());

// 🔥 IMPORTANT : dossier public
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

// =====================
// 🌐 PAGE SHOP
// =====================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'shop.html'));
});

// =====================
// 💰 USERS (test simple mémoire)
// =====================
let users = {};

// =====================
// 🤖 DISCORD BOT
// =====================
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// BOT READY
client.once('ready', () => {
    console.log(`🤖 Connecté en tant que ${client.user.tag}`);
});

// =====================
// 💰 BALANCE API
// =====================
app.get('/balance/:id', (req, res) => {
    const id = req.params.id;

    if (!users[id]) users[id] = { coins: 500 };

    res.json({ coins: users[id].coins });
});

// =====================
// 🛒 BUY API (SAFE VERSION)
// =====================
app.post('/buy', async (req, res) => {
    const { userId, item, price } = req.body;

    if (!userId || !item || !price) {
        return res.json({ error: "Missing data" });
    }

    if (!users[userId]) users[userId] = { coins: 500 };

    if (users[userId].coins < price) {
        return res.json({ error: "Pas assez d'ambre" });
    }

    users[userId].coins -= price;

    // 🔥 LOG DISCORD SAFE
    try {
        const channelId = process.env.SHOP_CHANNEL_ID;

        if (channelId && client.isReady()) {
            const channel = await client.channels.fetch(channelId);
            if (channel) {
                channel.send(
                    `🛒 Achat: ${item}\n👤 <@${userId}>\n💰 ${price} ambres`
                );
            }
        }
    } catch (e) {
        console.log("Discord log error:", e);
    }

    res.json({
        success: true,
        item,
        newBalance: users[userId].coins
    });
});

// =====================
// 🚀 START SERVER
// =====================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Serveur OK sur ${PORT}`);
});

// =====================
// 🤖 LOGIN BOT
// =====================
client.login(process.env.TOKEN);
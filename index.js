require('dotenv').config();

const express = require('express');
const path = require('path');
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

// 💰 DATABASE SIMPLE (mémoire)
let users = {};

// =====================
// 🤖 DISCORD BOT
// =====================
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', () => {
    console.log(`🤖 Connecté en tant que ${client.user.tag}`);
});

// =====================
// 🌐 SHOP PAGE
// =====================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'shop.html'));
});

// =====================
// 💰 GET BALANCE
// =====================
require('dotenv').config();

const express = require('express');
const path = require('path');
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

// 💥 ANTI CRASH RAILWAY
process.on('unhandledRejection', console.log);
process.on('uncaughtException', console.log);

// 💰 DATABASE SIMPLE
let users = {};

// 🤖 DISCORD BOT
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// =====================
// BOT READY
// =====================
client.once('ready', () => {
    console.log(`🤖 Connecté en tant que ${client.user.tag}`);
});

// =====================
// SHOP PAGE
// =====================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'shop.html'));
});

// =====================
// BALANCE
// =====================
app.get('/balance/:id', (req, res) => {
    const id = req.params.id;

    if (!users[id]) users[id] = { coins: 500 };

    res.json({ coins: users[id].coins });
});

// =====================
// BUY + DISCORD LOG SAFE
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

    users[userId].coins -= Number(price);

    // 🔥 DISCORD LOG SAFE
    try {
        const channelId = process.env.SHOP_CHANNEL_ID;

        if (client.isReady() && channelId) {
            const channel = await client.channels.fetch(channelId).catch(() => null);

            if (channel) {
                channel.send(
                    `🛒 Achat effectué\n👤 <@${userId}>\n📦 ${item}\n💰 ${price} ambres`
                );
            }
        }
    } catch (err) {
        console.log("Discord error:", err);
    }

    res.json({
        success: true,
        item,
        newBalance: users[userId].coins
    });
});

// =====================
// ADDCOINS FIX
// =====================
app.post('/addcoins', (req, res) => {
    const { userId, amount } = req.body;

    if (!userId || !amount) {
        return res.json({ error: "Missing data" });
    }

    if (!users[userId]) users[userId] = { coins: 500 };

    users[userId].coins += Number(amount);

    res.json({
        success: true,
        userId,
        newBalance: users[userId].coins
    });
});

// =====================
// START SERVER (RAILWAY SAFE)
// =====================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Serveur OK sur ${PORT}`);
});

// =====================
// LOGIN BOT
// =====================
client.login(process.env.TOKEN);
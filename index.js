require('dotenv').config();

const express = require('express');
const path = require('path');
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

// 💥 ANTI CRASH SAFE
process.on('unhandledRejection', console.log);
process.on('uncaughtException', console.log);

// 💰 DB SIMPLE (mémoire)
let users = {};

// =====================
// 🤖 DISCORD BOT
// =====================
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// =====================
// READY
// =====================
client.once('ready', () => {
    console.log(`🤖 Connecté en tant que ${client.user.tag}`);
});

// =====================
// 🌐 HOME SHOP
// =====================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'shop.html'));
});

// =====================
// 💰 BALANCE
// =====================
app.get('/balance/:id', (req, res) => {
    const id = req.params.id;

    if (!users[id]) users[id] = { coins: 500 };

    res.json({ coins: users[id].coins });
});

// =====================
// 🛒 BUY ITEM + DISCORD LOG SAFE
// =====================
app.post('/buy', (req, res) => {
    const { userId, item, price } = req.body;

    if (!userId || !item || !price) {
        return res.json({ error: "Missing data" });
    }

    if (!users[userId]) users[userId] = { coins: 500 };

    if (users[userId].coins < price) {
        return res.json({ error: "Pas assez d'ambre" });
    }

    users[userId].coins -= Number(price);

    // 🔥 LOG DISCORD NON BLOQUANT
    setTimeout(async () => {
        try {
            if (!client.isReady()) return;

            const channelId = process.env.SHOP_CHANNEL_ID;
            if (!channelId) return;

            const channel = await client.channels.fetch(channelId).catch(() => null);
            if (!channel) return;

            await channel.send(
                `🛒 **Achat Shop**\n👤 <@${userId}>\n📦 ${item}\n💰 ${price} ambres`
            );
        } catch (e) {
            console.log("Discord error:", e);
        }
    }, 800);

    res.json({
        success: true,
        item,
        newBalance: users[userId].coins
    });
});

// =====================
// 💰 ADDCOINS SAFE
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
// 🚀 START SERVER (RAILWAY SAFE)
// =====================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Serveur lancé sur ${PORT}`);
});

// =====================
// 🤖 LOGIN BOT
// =====================
client.login(process.env.TOKEN);
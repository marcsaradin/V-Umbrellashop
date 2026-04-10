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
app.get('/balance/:id', (req, res) => {
    const id = req.params.id;

    if (!users[id]) {
        users[id] = { coins: 500 };
    }

    res.json({ coins: users[id].coins });
});

// =====================
// 🛒 BUY ITEM + DISCORD LOG
// =====================
app.post('/buy', async (req, res) => {
    const { userId, item, price } = req.body;

    if (!userId || !item || !price) {
        return res.json({ error: "Missing data" });
    }

    if (!users[userId]) {
        users[userId] = { coins: 500 };
    }

    if (users[userId].coins < price) {
        return res.json({ error: "Pas assez d'ambre" });
    }

    users[userId].coins -= Number(price);

    // 🔥 LOG DISCORD
    try {
        const channelId = process.env.SHOP_CHANNEL_ID;

        if (channelId && client.isReady()) {
            const channel = await client.channels.fetch(channelId);

            if (channel) {
                await channel.send(
                    `🛒 **Achat effectué**

👤 <@${userId}>
📦 Item: **${item}**
💰 Prix: **${price} ambres**`
                );
            }
        }
    } catch (err) {
        console.log("❌ Discord buy error:", err);
    }

    res.json({
        success: true,
        item,
        newBalance: users[userId].coins
    });
});

// =====================
// 💰 ADDCOINS (ADMIN / API FIX)
// =====================
app.post('/addcoins', (req, res) => {
    const { userId, amount } = req.body;

    if (!userId || !amount) {
        return res.json({ error: "Missing data" });
    }

    if (!users[userId]) {
        users[userId] = { coins: 500 };
    }

    users[userId].coins += Number(amount);

    res.json({
        success: true,
        userId,
        newBalance: users[userId].coins
    });
});

// =====================
// 🚀 START SERVER
// =====================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Serveur lancé sur ${PORT}`);
});

// =====================
// 🤖 LOGIN BOT
// =====================
client.login(process.env.TOKEN);
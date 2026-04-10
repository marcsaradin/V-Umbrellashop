require('dotenv').config();

const express = require('express');
const path = require('path');
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// 💰 stockage simple
let users = {};

// =====================
// 🤖 BOT DISCORD
// =====================
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', () => {
    console.log(`🤖 Connecté en tant que ${client.user.tag}`);
});

// =====================
// 🌐 PAGE SHOP
// =====================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'shop.html'));
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
// 🛒 BUY
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

    // 🔥 message Discord simple
    try {
        const channel = await client.channels.fetch(process.env.SHOP_CHANNEL_ID);

        if (channel) {
            channel.send(`🛒 Achat\n<@${userId}> a acheté ${item} pour ${price}`);
        }
    } catch (err) {
        console.log(err);
    }

    res.json({
        success: true,
        newBalance: users[userId].coins
    });
});

// =====================
// 🚀 START
// =====================
app.listen(PORT, () => {
    console.log(`🌐 Serveur lancé sur ${PORT}`);
});

// =====================
// 🤖 LOGIN
// =====================
client.login(process.env.TOKEN);
require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

// =====================
// 💰 STOCKAGE (RAM)
// =====================
let users = {};

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

    if (!command.data || !command.data.name) {
        console.log(`❌ Commande invalide: ${file}`);
        continue;
    }

    client.commands.set(command.data.name, command);
    console.log(`✅ Commande chargée: ${command.data.name}`);
}

// =====================
// READY BOT
// =====================
client.once('clientReady', () => {
    console.log(`🤖 Connecté en tant que ${client.user.tag}`);
});

// =====================
// COMMANDES DISCORD
// =====================
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (err) {
        console.log(err);

        if (!interaction.replied) {
            await interaction.reply({
                content: "❌ Erreur commande",
                ephemeral: true
            });
        }
    }
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
// 🛒 BUY SYSTEM
// =====================
app.post('/buy', async (req, res) => {
    const { userId, item, price } = req.body;

    if (!userId || !item || !price) {
        return res.json({ error: "Missing data" });
    }

    if (!users[userId]) users[userId] = { coins: 500 };

    if (users[userId].coins < price) {
        return res.json({ error: "Pas assez de coins" });
    }

    users[userId].coins -= price;

    // 🔔 log discord (safe)
    try {
        const channel = await client.channels.fetch(process.env.SHOP_CHANNEL_ID).catch(() => null);

        if (channel) {
            channel.send(`🛒 Achat: <@${userId}> a acheté **${item}** pour ${price} coins`);
        }
    } catch (e) {
        console.log("Channel error:", e);
    }

    res.json({
        success: true,
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
// LOGIN BOT
// =====================
client.login(process.env.TOKEN);
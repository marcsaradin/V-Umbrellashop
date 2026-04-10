require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// =====================
// 💰 STOCKAGE SIMPLE
// =====================
let users = {};

// =====================
// 🤖 BOT DISCORD
// =====================
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// =====================
// 📂 CHARGER COMMANDES
// =====================
client.commands = new Map();

const commandsPath = path.join(__dirname, 'commands');

if (fs.existsSync(commandsPath)) {
    const files = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

    for (const file of files) {
        try {
            const command = require(`./commands/${file}`);

            if (!command.data || !command.data.name) {
                console.log(`❌ Commande invalide: ${file}`);
                continue;
            }

            client.commands.set(command.data.name, command);
            console.log(`✅ Commande chargée: ${command.data.name}`);

        } catch (err) {
            console.log(`❌ Erreur fichier: ${file}`);
            console.error(err);
        }
    }
}

// =====================
// ⚡ BOT READY
// =====================
client.once('ready', () => {
    console.log(`🤖 Connecté en tant que ${client.user.tag}`);
});

// =====================
// 🎮 GESTION COMMANDES
// =====================
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (err) {
        console.error("Erreur commande:", err);

        if (!interaction.replied) {
            await interaction.reply({
                content: "❌ Erreur commande",
                ephemeral: true
            });
        }
    }
});

// =====================
// 🌐 SHOP PAGE
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
// 🛒 BUY + MESSAGE DISCORD
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

    // 🔥 MESSAGE DISCORD
    try {
        const channel = await client.channels.fetch(process.env.SHOP_CHANNEL_ID);

        if (channel) {
            await channel.send(
                `🛒 Achat\n👤 <@${userId}>\n📦 ${item}\n💰 ${price}`
            );
        }
    } catch (err) {
        console.log("Erreur Discord:", err);
    }

    res.json({
        success: true,
        newBalance: users[userId].coins
    });
});

// =====================
// 🚀 START SERVEUR
// =====================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Serveur lancé sur ${PORT}`);
});

// =====================
// 🤖 LOGIN
// =====================
client.login(process.env.TOKEN);
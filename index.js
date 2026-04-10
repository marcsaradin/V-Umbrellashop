require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();
app.use(express.json());

// 🔥 Permet d'afficher ton shop HTML
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

// =====================
// 🌐 SHOP WEB
// =====================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'shop.html'));
});

// =====================
// 💰 MEMOIRE JOUEURS (test simple)
// =====================

let users = {};

// =====================
// 🤖 DISCORD BOT
// =====================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
});

client.commands = new Map();

const commandsPath = path.join(__dirname, 'commands');

if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

    for (const file of commandFiles) {
        try {
            const command = require(`./commands/${file}`);

            if (!command.data || !command.data.name) {
                console.log(`❌ Commande invalide: ${file}`);
                continue;
            }

            client.commands.set(command.data.name, command);
            console.log(`✅ Commande chargée: ${command.data.name}`);

        } catch (err) {
            console.log(`❌ Erreur commande: ${file}`);
            console.error(err);
        }
    }
} else {
    console.log("❌ Dossier commands introuvable");
}

// =====================
// ⚡ READY BOT
// =====================

client.once('clientReady', () => {
    console.log("🤖 Bot connecté");
    console.log(`🤖 Connecté en tant que ${client.user.tag}`);
});

// =====================
// 🎮 COMMANDES DISCORD
// =====================

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (err) {
        console.error(err);

        if (!interaction.replied) {
            await interaction.reply({
                content: "❌ Erreur commande",
                ephemeral: true
            });
        }
    }
});

// =====================
// 💰 API BALANCE
// =====================

app.get('/balance/:id', (req, res) => {
    const id = req.params.id;

    if (!users[id]) users[id] = { coins: 500 };

    res.json({ coins: users[id].coins });
});

// =====================
// 🛒 API BUY + LOG DISCORD
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

    // 🔥 LOG DISCORD
    try {
        const channelId = process.env.SHOP_CHANNEL_ID;

        if (channelId) {
            const channel = await client.channels.fetch(channelId).catch(() => null);

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
        console.error("❌ Erreur Discord:", err);
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
    console.log(`🌐 Serveur lancé sur ${PORT}`);
});

// =====================
// 🤖 LOGIN BOT
// =====================

client.login(process.env.TOKEN);
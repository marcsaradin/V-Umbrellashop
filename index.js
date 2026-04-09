require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();
app.use(express.json());

// 🌐 PORT RAILWAY
const PORT = process.env.PORT;

// =====================
// 💾 DATABASE UNIQUE
// =====================
const DB_FILE = './users.json';

function loadDB() {
    if (!fs.existsSync(DB_FILE)) return {};
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function saveDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

let users = loadDB();

function getUser(id) {
    if (!users[id]) {
        users[id] = { coins: 500 };
    }
    return users[id];
}

// =====================
// 🌐 API SHOP
// =====================

// 🟢 HOME
app.get('/', (req, res) => {
    res.send('V-Umbrella API is online 🚀');
});

// 💰 BALANCE
app.get('/balance/:id', (req, res) => {
    const user = getUser(req.params.id);
    res.json({ coins: user.coins });
});

// 🛒 BUY ITEM
app.post('/buy', (req, res) => {
    const { userId, item, price } = req.body;

    if (!userId || !item || !price) {
        return res.json({ error: "Missing data" });
    }

    const user = getUser(userId);

    if (user.coins < price) {
        return res.json({ error: "Pas assez d'ambre" });
    }

    user.coins -= price;

    saveDB(users);

    res.json({
        success: true,
        item,
        newBalance: user.coins
    });
});

// =====================
// 🤖 DISCORD BOT
// =====================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Map();

const commandsPath = path.join(__dirname, 'commands');

if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

    for (const file of commandFiles) {

        if (file === "daily.js") continue;

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
}

// ⚡ READY FIX
client.once('clientReady', () => {
    console.log(`🤖 Connecté en tant que ${client.user.tag}`);
});

// 🎮 COMMANDES
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);

        if (!interaction.replied) {
            await interaction.reply({
                content: '❌ Erreur commande',
                ephemeral: true
            });
        }
    }
});

// 🚀 START RAILWAY
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Serveur lancé sur ${PORT}`);
});

// 🤖 LOGIN BOT
client.login(process.env.TOKEN)
    .then(() => console.log("🤖 Bot connecté"))
    .catch(err => console.error("❌ Token invalide"));
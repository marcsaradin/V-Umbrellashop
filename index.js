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
// 💾 DB UNIQUE
// =====================
const FILE = './users.json';
let users = {};

if (fs.existsSync(FILE)) {
    users = JSON.parse(fs.readFileSync(FILE));
}

function saveUsers() {
    fs.writeFileSync(FILE, JSON.stringify(users, null, 2));
}

// =====================
// 🤖 BOT
// =====================
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.commands = new Map();

const commandFiles = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if (!command.data || !command.data.name) continue;
    client.commands.set(command.data.name, command);
}

client.once('clientReady', () => {
    console.log(`🤖 Connecté en tant que ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (err) {
        console.error(err);
    }
});

// =====================
// 🌐 SHOP
// =====================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// =====================
// 💰 BALANCE
// =====================
app.get('/balance/:id', (req, res) => {
    const id = req.params.id;

    if (!users[id]) {
        users[id] = { coins: 0, inventory: [] };
        saveUsers();
    }

    res.json({ coins: users[id].coins });
});

// =====================
// 🛒 ACHAT
// =====================
app.post('/buy', async (req, res) => {
    const { userId, item, price } = req.body;

    if (!users[userId]) {
        users[userId] = { coins: 0, inventory: [] };
    }

    if (users[userId].coins < price) {
        return res.json({ error: "Pas assez d'ambres" });
    }

    users[userId].coins -= price;
    users[userId].inventory.push(item);

    saveUsers();

    try {
        const channel = await client.channels.fetch(process.env.SHOP_CHANNEL_ID).catch(() => null);
        if (channel) {
            channel.send(`🛒 <@${userId}> a acheté **${item}** pour ${price} ambres`);
        }
    } catch {}

    res.json({
        item,
        newBalance: users[userId].coins
    });
});

// =====================
// 🚀 START
// =====================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Serveur lancé sur ${PORT}`);
});

client.login(process.env.TOKEN);
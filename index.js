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
// 💾 DB (AMBRES)
// =====================
const FILE = './users.json';

function loadUsers() {
    if (!fs.existsSync(FILE)) return {};
    return JSON.parse(fs.readFileSync(FILE));
}

function saveUsers(data) {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

// =====================
// 🤖 BOT DISCORD
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
    console.log(`✅ Commande chargée: ${command.data.name}`);
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
        if (!interaction.replied) {
            interaction.reply({ content: "❌ Erreur commande", ephemeral: true });
        }
    }
});

// =====================
// 🌐 SHOP
// =====================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// =====================
// 💰 BALANCE (AMBRES)
// =====================
app.get('/balance/:id', (req, res) => {

    const users = loadUsers();
    const id = req.params.id;

    if (!users[id]) {
        users[id] = { ambre: 0, inventory: [] };
        saveUsers(users);
    }

    console.log("BALANCE:", id, users[id]);

    res.json({ ambre: users[id].ambre });
});

// =====================
// 🛒 ACHAT
// =====================
app.post('/buy', async (req, res) => {

    const users = loadUsers();
    const { userId, item, price } = req.body;

    if (!users[userId]) {
        users[userId] = { ambre: 0, inventory: [] };
    }

    if (users[userId].ambre < price) {
        return res.json({ error: "❌ Pas assez d'ambres" });
    }

    users[userId].ambre -= price;
    users[userId].inventory.push(item);

    saveUsers(users);

    console.log("BUY:", userId, users[userId]);

    try {
        const channel = await client.channels.fetch(process.env.SHOP_CHANNEL_ID).catch(() => null);

        if (channel) {
            channel.send(`🛒 <@${userId}> a acheté **${item}** pour ${price} ambres !`);
        }
    } catch (e) {
        console.log("Erreur Discord:", e);
    }

    res.json({
        item: item,
        newBalance: users[userId].ambre
    });
});

// =====================
// 🚀 START SERVEUR
// =====================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Serveur lancé sur le port ${PORT}`);
});

// =====================
// 🔐 LOGIN BOT
// =====================
client.login(process.env.TOKEN);
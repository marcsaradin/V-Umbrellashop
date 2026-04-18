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
// 💾 DATABASE (users.json)
// =====================
const FILE = './users.json';

function loadUsers() {
    if (!fs.existsSync(FILE)) return {};
    return JSON.parse(fs.readFileSync(FILE, 'utf8'));
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

// Charger commandes
const commandFiles = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));

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
        console.log(`❌ Erreur dans ${file}`);
        console.error(err);
    }
}

// Bot ready
client.once('clientReady', () => {
    console.log(`🤖 Connecté en tant que ${client.user.tag}`);
});

// Slash commands
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
// 🌐 SITE
// =====================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// =====================
// 💰 BALANCE
// =====================
app.get('/balance/:id', (req, res) => {

    const users = loadUsers();
    const id = req.params.id;

    if (!users[id]) {
        users[id] = { anbre: 0, inventory: [] };
        saveUsers(users);
    }

    console.log("💰 BALANCE:", id, users[id].coins);

    res.json({ ambre: users[id].ambre });
});

// =====================
// 🛒 ACHAT
// =====================
app.post('/buy', async (req, res) => {

    const users = loadUsers();
    const { userId, item, price } = req.body;

    if (!userId || !item || !price) {
        return res.json({ error: "Données manquantes" });
    }

    if (!users[userId]) {
        users[userId] = { ambre: 0, inventory: [] };
    }

    if (users[userId].ambre < price) {
        return res.json({ error: "Pas assez d'ambres" });
    }

    users[userId].ambre -= price;
    users[userId].inventory.push(item);

    saveUsers(users);

    console.log("🛒 ACHAT:", userId, item, price);

    // 🔥 MESSAGE DISCORD
    try {
        const channel = await client.channels.fetch(process.env.SHOP_CHANNEL_ID);

        if (channel) {
            await channel.send(
                `🛒 **Nouvel achat !**\n` +
                `👤 <@${userId}>\n` +
                `📦 ${item}\n` +
                `💰 ${price} ambres\n` +
                `💳 Solde restant : ${users[userId].coins}`
            );
        }

    } catch (err) {
        console.log("❌ Erreur Discord :", err);
    }

    res.json({
        item,
        newBalance: users[userId].coins
    });
});

// =====================
// 🚀 LANCEMENT
// =====================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Serveur lancé sur ${PORT}`);
});

// =====================
// 🔐 LOGIN BOT
// =====================
client.login(process.env.TOKEN);
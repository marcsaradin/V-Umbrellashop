require('dotenv').config();
const express = require('express');
const fs = require('fs');
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname)); // 🔥 IMPORTANT pour shop.html

// --- BOT DISCORD ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log(`🤖 Connecté en tant que ${client.user.tag}`);
});

client.login(process.env.TOKEN);

// --- STOCKAGE JOUEURS ---
let players = {};

if (fs.existsSync('players.json')) {
    players = JSON.parse(fs.readFileSync('players.json'));
}

// Sauvegarde automatique
function savePlayers() {
    fs.writeFileSync('players.json', JSON.stringify(players, null, 2));
}

// --- GAGNER DES AMBRES EN PARLANT ---
client.on('messageCreate', (message) => {
    if (message.author.bot) return;

    const userId = message.author.id;

    if (!players[userId]) {
        players[userId] = { ambre: 0, inventory: [] };
    }

    players[userId].ambre += 10; // 💰 10 ambres par message
    savePlayers();
});

// --- ROUTES API ---

// Récupérer solde
app.get('/balance/:userId', (req, res) => {
    const userId = req.params.userId;

    if (!players[userId]) {
        players[userId] = { ambre: 0, inventory: [] };
        savePlayers();
    }

    res.json({
        coins: players[userId].ambre
    });
});

// Acheter un item
app.post('/buy', (req, res) => {
    const { userId, item, price } = req.body;

    if (!players[userId]) {
        players[userId] = { ambre: 0, inventory: [] };
    }

    if (players[userId].ambre < price) {
        return res.json({ error: "❌ Pas assez d'ambre !" });
    }

    players[userId].ambre -= price;
    players[userId].inventory.push(item);

    savePlayers();

    // 🔔 NOTIF DISCORD
    const channel = client.channels.cache.get('ID_DU_CHANNEL'); // ⚠️ MET TON ID ICI
    if (channel) {
        channel.send(`🛒 <@${userId}> a acheté **${item}** pour ${price} ambres !`);
    }

    res.json({
        item,
        newBalance: players[userId].ambre
    });
});

// --- PAGE PAR DÉFAUT ---
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/shop.html');
});

// --- LANCEMENT ---
app.listen(PORT, () => {
    console.log(`🌐 Serveur lancé sur http://localhost:${PORT}`);
});
// index.js
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

// Création du client Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Collection pour stocker les commandes
client.commands = new Collection();

// Chargement des commandes depuis le dossier commands
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    // Utilisation du fallback si data.name est undefined
    const commandName = command.data?.name || file.replace('.js', '');
    client.commands.set(commandName, command);
}

// Event ready
client.once('ready', () => {
    console.log(`Connecté en tant que ${client.user.tag}`);
});

// Gestion des commandes préfixées (message-based)
client.on('messageCreate', async message => {
    if (!message.content.startsWith(process.env.PREFIX) || message.author.bot) return;

    const args = message.content.slice(process.env.PREFIX.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);
    if (!command) return;

    try {
        await command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply("Une erreur est survenue en exécutant la commande !");
    }
});

// Gestion des commandes slash
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Une erreur est survenue.', ephemeral: true });
    }
});

// Connexion du bot
client.login(process.env.TOKEN);
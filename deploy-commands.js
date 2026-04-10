const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log("🚀 Début deploy slash commands...");

const commands = [];

// 📂 dossier commands (SAFE PATH)
const commandsPath = path.join(__dirname, 'commands');

if (!fs.existsSync(commandsPath)) {
    console.error("❌ Dossier commands introuvable !");
    process.exit(1);
}

const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    try {
        const command = require(path.join(commandsPath, file));

        if (!command?.data?.toJSON) {
            console.log(`❌ Ignoré (invalide): ${file}`);
            continue;
        }

        commands.push(command.data.toJSON());
        console.log(`✅ Chargé: ${command.data.name}`);

    } catch (err) {
        console.log(`❌ Erreur fichier: ${file}`);
        console.error(err);
    }
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

// 🔥 MODE GUILD (RECOMMANDÉ = instant)
const route = Routes.applicationGuildCommands(
    process.env.CLIENT_ID,
    process.env.GUILD_ID
);

// 💥 DEPLOY
(async () => {
    try {
        console.log("📡 Envoi des commandes à Discord...");

        await rest.put(route, { body: commands });

        console.log("✅ Commandes slash déployées avec succès !");
        console.log(`📊 Total: ${commands.length}`);

    } catch (error) {
        console.error("❌ Erreur deploy:");
        console.error(error);
    }
})();
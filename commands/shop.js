const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

const shopItems = [
    {
        name: 'Kit Épique',
        price: 100,
        description: 'Ptera + selle épique (castré), armure épique, arme épique (pioche, hache, arbalète)'
    },
    {
        name: 'Kit Farm',
        price: 100,
        description: 'Argentavis, Ankylosaure, Doedicurus (castrés) + selle gris'
    },
    {
        name: 'Kit Mythique VIP',
        price: 700,
        description: '+500 points de niveau, armure mythique en métal, arme mythique (pioche, hache, arbalète), Ptera + selle mythique (castré)'
    },
    {
        name: 'Ressources',
        price: 600,
        description: '5k de chaque ressource'
    }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Afficher le shop ou acheter un kit')
        .addStringOption(option =>
            option.setName('article')
                .setDescription('Le nom du kit que tu veux acheter')
                .setRequired(false)
        ),
    async execute(interaction) {
        const players = JSON.parse(fs.readFileSync('players.json'));
        const userId = interaction.user.id;
        const choice = interaction.options.getString('article');

        if (!players[userId]) players[userId] = { coins: 0, xp: 0, level: 1, inventory: [], lastDaily: null };

        if (!choice) {
            let shopList = '🛒 **Shop:**\n';
            shopItems.forEach(item => shopList += `**${item.name}** - ${item.price} coins\n  Description: ${item.description}\n\n`);
            return interaction.reply(shopList);
        }

        const item = shopItems.find(i => i.name.toLowerCase() === choice.toLowerCase());
        if (!item) return interaction.reply("❌ Objet non trouvé.");

        if (players[userId].coins < item.price) return interaction.reply("❌ Tu n'as pas assez de coins !");
        players[userId].coins -= item.price;
        players[userId].inventory.push(item.name);

        fs.writeFileSync('players.json', JSON.stringify(players, null, 2));
        interaction.reply(`✅ Tu as acheté **${item.name}** pour ${item.price} coins !`);
    }
};
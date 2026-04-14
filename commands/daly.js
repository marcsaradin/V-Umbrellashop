module.exports = {
  name: "daily",
  description: "Commande à compléter plus tard",

  execute(message) {
    return message.reply("⏳ Commande en développement !");
  }
};
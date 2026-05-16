const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const afkUsers = new Map();

client.on('ready', () => {
  console.log(`${client.user.tag} aktif!`);
});

client.on('messageCreate', message => {
  if (message.author.bot) return;

  if (afkUsers.has(message.author.id)) {
    afkUsers.delete(message.author.id);
    message.reply('AFK kaldırıldı.');
  }

  message.mentions.users.forEach(user => {
    if (afkUsers.has(user.id)) {
      message.reply(`${user.username} AFK: ${afkUsers.get(user.id)}`);
    }
  });

  if (message.content.startsWith('!afk')) {
    const reason =
      message.content.split(' ').slice(1).join(' ') || 'Sebep yok';

    afkUsers.set(message.author.id, reason);

    message.reply(`AFK oldun: ${reason}`);
  }
});

client.login(process.env.BOT_TOKEN);

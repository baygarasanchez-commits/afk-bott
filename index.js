const {
  Client,
  GatewayIntentBits,
  ChannelType
} = require("discord.js");

const {
  joinVoiceChannel,
  entersState,
  VoiceConnectionStatus
} = require("@discordjs/voice");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.once("ready", async () => {
  console.log(`${client.user.tag} aktif!`);

  const guild = client.guilds.cache.get(process.env.GUILD_ID);

  if (!guild) {
    return console.log("Sunucu bulunamadı!");
  }

  const channel = guild.channels.cache.get(process.env.VOICE_CHANNEL_ID);

  if (!channel) {
    return console.log("Ses kanalı bulunamadı!");
  }

  if (channel.type !== ChannelType.GuildVoice) {
    return console.log("Bu bir ses kanalı değil!");
  }

  try {
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
      selfDeaf: true,
      selfMute: false
    });

    await entersState(connection, VoiceConnectionStatus.Ready, 30000);

    console.log(`Bağlandı: ${channel.name}`);

  } catch (err) {
    console.error(err);
  }
});

client.login(process.env.BOT_TOKEN);

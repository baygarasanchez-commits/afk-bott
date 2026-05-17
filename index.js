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

let connection;

client.once("ready", async () => {
  console.log(`${client.user.tag} aktif!`);

  try {
    // CACHE yerine FETCH (deploy için kritik)
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    if (!guild) return console.log("Sunucu bulunamadı!");

    const channel = await guild.channels.fetch(process.env.VOICE_CHANNEL_ID);
    if (!channel) return console.log("Ses kanalı bulunamadı!");

    if (channel.type !== ChannelType.GuildVoice) {
      return console.log("Bu bir ses kanalı değil!");
    }

    connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
      selfDeaf: true,
      selfMute: false
    });

    console.log("Voice join denendi");

    // ⚠️ BOTU KİLİTLEMEZ, SADECE DENER
    entersState(connection, VoiceConnectionStatus.Ready, 15000)
      .then(() => console.log("Voice READY"))
      .catch((err) => {
        console.log("Voice READY olmadı:", err.message);
      });

    connection.on("stateChange", (oldState, newState) => {
      console.log(`Voice state: ${oldState.status} -> ${newState.status}`);
    });

  } catch (err) {
    console.error("Ready error:", err);
  }
});

// Güvenlik (deploy crash fix)
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});

process.on("SIGINT", () => {
  if (connection) connection.destroy();
  process.exit(0);
});

process.on("SIGTERM", () => {
  if (connection) connection.destroy();
  process.exit(0);
});

client.login(process.env.BOT_TOKEN);

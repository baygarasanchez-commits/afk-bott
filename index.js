const {
  Client,
  GatewayIntentBits,
  ChannelType
} = require("discord.js");

const {
  joinVoiceChannel,
  entersState,
  VoiceConnectionStatus,
  getVoiceConnection
} = require("@discordjs/voice");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

let connection;
let reconnectInterval;

async function connectToVoice() {
  try {
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const channel = await guild.channels.fetch(process.env.VOICE_CHANNEL_ID);

    if (!channel || channel.type !== ChannelType.GuildVoice) {
      return console.log("Geçersiz voice channel");
    }

    // varsa eski connection temizle
    const existing = getVoiceConnection(guild.id);
    if (existing) existing.destroy();

    connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
      selfDeaf: true,
      selfMute: false
    });

    console.log("Voice bağlanma denendi");

    entersState(connection, VoiceConnectionStatus.Ready, 15000)
      .then(() => console.log("Voice READY"))
      .catch((err) => console.log("Voice READY timeout:", err.message));

    // STATE MONITOR
    connection.on("stateChange", (oldState, newState) => {
      console.log(`Voice: ${oldState.status} -> ${newState.status}`);

      // Eğer disconnected olursa tekrar bağlan
      if (newState.status === VoiceConnectionStatus.Disconnected) {
        console.log("Disconnected → reconnecting...");
        setTimeout(connectToVoice, 3000);
      }
    });

  } catch (err) {
    console.error("Voice connect error:", err);
    setTimeout(connectToVoice, 5000);
  }
}

client.once("ready", async () => {
  console.log(`${client.user.tag} aktif!`);

  await connectToVoice();

  // :repeat: sürekli kontrol (keep-alive + auto-fix)
  reconnectInterval = setInterval(() => {
    const vc = getVoiceConnection(process.env.GUILD_ID);

    if (!vc || vc.state.status === "disconnected") {
      console.log("Voice yok → yeniden bağlanılıyor");
      connectToVoice();
    }
  }, 30000);
});

// CRASH SAFE
process.on("unhandledRejection", (err) => {
  console.error("Unhandled:", err);
});

process.on("SIGINT", () => {
  if (reconnectInterval) clearInterval(reconnectInterval);
  const vc = getVoiceConnection(process.env.GUILD_ID);
  if (vc) vc.destroy();
  process.exit(0);
});

process.on("SIGTERM", () => {
  if (reconnectInterval) clearInterval(reconnectInterval);
  const vc = getVoiceConnection(process.env.GUILD_ID);
  if (vc) vc.destroy();
  process.exit(0);
});

client.login(process.env.BOT_TOKEN);

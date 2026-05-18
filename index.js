const express = require("express");
const {
    Client,
    GatewayIntentBits
} = require("discord.js");

const {
    joinVoiceChannel,
    entersState,
    VoiceConnectionStatus
} = require("@discordjs/voice");

const app = express();

/*
RENDER TIMEOUT FIX
*/
app.get("/", (req, res) => {
    res.send("Bot aktif");
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Web server aktif");
});

/*
DISCORD CLIENT
*/
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});

/*
ANTI CRASH
*/
process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);
process.on("uncaughtExceptionMonitor", console.error);

/*
READY
*/
client.once("ready", async () => {
    console.log(`${client.user.tag} aktif`);

    try {
        const guild = await client.guilds.fetch(process.env.GUILD_ID);

        const channel = await guild.channels.fetch(
            process.env.VOICE_CHANNEL_ID
        );

        if (!channel) {
            return console.log("Ses kanalı bulunamadı");
        }

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false
        });

        await entersState(connection, VoiceConnectionStatus.Ready, 30000);

        console.log("Ses kanalına bağlandı");

    } catch (err) {
        console.log(err);
    }
});

/*
LOGIN
*/
client.login(process.env.BOT_TOKEN);

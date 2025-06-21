const {
  Client,
  IntentsBitField,
  messageLink,
  MessageFlags,
  EmbedBuilder,
  ActivityType,
} = require("discord.js");

const path = require("path");
const eventHandler = require("./handlers/eventHandler.js");
const { notifyDevs } = require("./handlers/notifyDevs.js");
require("dotenv").config();

const token = process.env.TOKEN;

const client = new Client({
  intents: [
    /* https://discord.com/developers/docs/events/gateway#list-of-intents */
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

eventHandler(client);

console.log("⌚ Attempting bot login...");
notifyDevs('⌚ Attempting bot login...')
client.login(token);

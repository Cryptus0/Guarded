function notifyDevs(MessageContent) {
    const { WebhookClient, EmbedBuilder, messageLink } = require('discord.js');
    require("dotenv").config();

    const id = process.env.DEV_WEBHOOK_ID;
    const token = process.env.DEV_WEBHOOK_TOKEN;

    // Create webhook client using webhook ID and token
    const webhookClient = new WebhookClient({
    id: id,
    token: token,
    });

    // Create an embed
    const embed = new EmbedBuilder()
    .setTitle('⚠️ System Notification ⚠️')
    .setDescription(MessageContent)
    .setColor(0xff7d00)
    .setTimestamp();

    // Send the embed
    webhookClient.send({ embeds: [embed] })
    .catch(console.error);
}

module.exports = { notifyDevs };
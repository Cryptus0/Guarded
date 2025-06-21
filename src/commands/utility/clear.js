const {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  Client,
  Interaction,
  EmbedBuilder,
} = require("discord.js");
const { notifyDevs } = require("../../handlers/notifyDevs");

module.exports = {
    /**
     *
     * @param {PermissionFlagsBits} PermissionFlagsBits
     * @param {Interaction} interaction
     * @param {Client} client
     */

    callback: async (client, interaction) => {

        try {
            const channel = interaction.channel
            const limit = interaction.options.get("messages").value
            const messages = await channel.messages.fetch({ limit })

            await interaction.deferReply({ ephemeral: true });
            let count = 0;
            await messages.forEach(message => {
                message.delete()
                count = count + 1;
                interaction.editReply(`⚙️ Deleted \`${count}\` messages.`)
            });

            let reason = interaction.options.get("reason")?.value ?? "No Reason Provided";

            const clearedEmbed = new EmbedBuilder()
                .setColor(0x33ff5d)
                .setTitle("✅ Cleared Messages ✅")
                .setDescription(
                `Successfully cleared \`${count}\` messages.\n\nReason: ${reason}`
                )
                .setFooter({ text: "Guarded" });

            await interaction.editReply({ embeds: [clearedEmbed] });
            await new Promise(resolve => setTimeout(resolve, 3500));
            // Wierd ass waiting line ^^^
            interaction.deleteReply()
        } catch (err) {
            notifyDevs(`❌ Error Detected: ${err}`)
        }
    },

    name: "clear",
    description: "Clear a channel of its messages.",
    options: [
    {
        name: "messages",
        description: "How many messages should I delete",
        required: true,
        type: ApplicationCommandOptionType.Integer,
    },
    {
        name: "reason",
        description: "Why should I clear these messages?",
        required: false,
        type: ApplicationCommandOptionType.String,
    },
    ],
    botPermissions: [PermissionFlagsBits.ManageChannels],
    permissionsAny: [
    PermissionFlagsBits.ManageChannels,
    PermissionFlagsBits.ManageMessages,
    ],
    // devOnly: Boolean,
    // testOnly: Boolean,
    // deleted: Boolean,
    // permissionsRequired: [PermissionFlagsBits.ManageChannels],
}
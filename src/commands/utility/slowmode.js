const {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  Client,
  Interaction,
  EmbedBuilder,
} = require("discord.js");
const parse = require("parse-duration").default;
const prettyMs = require("pretty-ms").default;

module.exports = {
  /**
   *
   * @param {PermissionFlagsBits} PermissionFlagsBits
   * @param {Interaction} interaction
   * @param {Client} client
   */

  callback: async (client, interaction) => {
    const parsedDuration = parse(interaction.options.get("time").value);
    const seconds = parsedDuration / 1000;
    const channelId = interaction.options.get("channel")?.value;
    const currentChannel = interaction.channel;
    const reason =
      interaction.options.get("reason")?.value || "❓ No Reason Provided";

    try {
      if (seconds > 21600) {
        const maxSlowmodeEmbed = new EmbedBuilder()
          .setColor(0xe03a3a)
          .setTitle("⚠️ Slowmode Limit Exceeded ⚠️")
          .setDescription(
            `The max slowmode Discord allows is 6 hours. You set it to ${prettyMs(
              parsedDuration
            )}.`
          )
          .setFooter({ text: "Guarded" });

        await interaction.reply({
          embeds: [maxSlowmodeEmbed],
          ephemeral: true,
        });
        return;
      } else {
        if (channelId) {
          const channel = await client.channels.fetch(channelId);
          await channel.setRateLimitPerUser(seconds, reason);

          if (seconds > 0) {
            const channelSetEmbed = new EmbedBuilder()
              .setColor(0x3ae058)
              .setTitle("⏳ Slowmode Set ⏳")
              .setDescription(
                `This channel's slowmode has been set to ${prettyMs(
                  parsedDuration
                )} for the reason '${reason}'.`
              )
              .setFooter({ text: "Guarded" });

            await channel.send({ embeds: [channelSetEmbed] });
          } else {
            const channelClearedEmbed = new EmbedBuilder()
              .setColor(0x3ae058)
              .setTitle("🚫 Slowmode Cleared 🚫")
              .setDescription(
                "This channel's slowmode has been cleared. Have fun chatting!"
              )
              .setFooter({ text: "Guarded" });

            await channel.send({ embeds: [channelClearedEmbed] });
          }

          const successEmbed = new EmbedBuilder()
            .setColor(0x3ae058)
            .setTitle("✅ Slowmode Changed ✅")
            .setDescription("I've successfully changed the channel's slowmode.")
            .setFooter({ text: "Guarded" });

          await interaction.reply({ embeds: [successEmbed], ephemeral: true });
          return;
        }

        await currentChannel.setRateLimitPerUser(seconds, reason);
      }

      if (seconds > 0) {
        const slowmodeSetEmbed = new EmbedBuilder()
          .setColor(0x3ae058)
          .setTitle("⏳ Slowmode Set ⏳")
          .setDescription(
            `This channel's slowmode has been set to ${prettyMs(
              parsedDuration
            )} for the reason '${reason}'.`
          )
          .setFooter({ text: "Guarded" });

        await interaction.reply({ embeds: [slowmodeSetEmbed] });
      } else {
        const slowmodeClearedEmbed = new EmbedBuilder()
          .setColor(0x3ae058)
          .setTitle("🚫 Slowmode Cleared 🚫")
          .setDescription(
            "This channel's slowmode has been cleared. Have fun chatting!"
          )
          .setFooter({ text: "Guarded" });

        await interaction.reply({ embeds: [slowmodeClearedEmbed] });
      }
    } catch (error) {
      console.log(
        `There was an error with setting that channel's slowmode. This is most likely a problem with the bot itself. If this is a recurring problem, contact a developer and give them the 'Error Information'. Error Information: ${error}`
      );
    }
  },

  name: "slowmode",
  description: "Change the slowmode of a channel.",
  options: [
    {
      name: "time",
      description: "How long should the slowmode be (Ex: 1h, 3d, 0s)?",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
    {
      name: "channel",
      description: "Which channel should I apply the slowmode to?",
      required: false,
      type: ApplicationCommandOptionType.Channel,
    },
    {
      name: "reason",
      description: "Why should I apply a slowmode to this channel?",
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

  /* 
  Permissions Any vs Permissions Required

  Permissions Any will check if the user has *any* of the specified permissions.
  Permissions Required will check if the user has *all* of the specified permissions.
  */
};

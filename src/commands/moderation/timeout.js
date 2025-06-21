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
    const targetUserId = interaction.options.get("user").value;
    const reason =
      interaction.options.get("reason")?.value || "❓ No Reason Provided";

    const parsedDuration = parse(interaction.options.get("time").value);
    await interaction.deferReply({ ephemeral: true });
    let targetUser;

    try {
      targetUser = await interaction.guild.members.fetch(targetUserId);
    } catch {
      const cantFindEmbed = new EmbedBuilder()
        .setColor(0xe03a3a)
        .setTitle("❓ User Not Found ❓")
        .setDescription("I could'nt find that member in this server.")
        .setFooter({ text: "Guarded" });

      await interaction.editReply({ embeds: [cantFindEmbed] });
      return;
    }

    if (targetUser.id === interaction.guild.ownerId) {
      const serverOwnerEmbed = new EmbedBuilder()
        .setColor(0x2358de)
        .setTitle("🛡️ Server Owner 🛡️")
        .setDescription("You can't timeout the server owner.")
        .setFooter({ text: "Guarded" });

      await interaction.editReply({ embeds: [serverOwnerEmbed] });
      return;
    }

    const targetUserRolePosition = targetUser.roles.highest.position; // Highest role of the target user
    const requestUserRolePosition = interaction.member.roles.highest.position; // Highest role of the user running the command
    const botRolePosition = interaction.guild.members.me.roles.highest.position; // Highest role of the bot

    if (targetUserRolePosition >= requestUserRolePosition) {
      const roleConflictEmbed = new EmbedBuilder()
        .setColor(0x245dd1)
        .setTitle("🛡️ Role Conflict 🛡️")
        .setDescription(
          "It looks like that user's role is the same or higher than yours."
        )
        .setFooter({ text: "Guarded" });

      await interaction.editReply({ embeds: [roleConflictEmbed] });
      return;
    }

    if (targetUserRolePosition >= botRolePosition) {
      const botMissingPermsEmbed = new EmbedBuilder()
        .setColor(0x245dd1)
        .setTitle("🤖 Missing Permissions 🤖")
        .setDescription(
          "There was a problem with timing out that user. It looks like they have the same or higher role than me. Contact a server administrator to fix this issue."
        )
        .setFooter({ text: "Guarded" });

      await interaction.editReply({ embeds: [botMissingPermsEmbed] });
      return;
    }

    // Timeout the targetUser
    try {
      await targetUser.timeout(parsedDuration, reason);

      const timeoutWorks = new EmbedBuilder()
        .setTitle("⌚ Timeout Successful ⌚")
        .addFields(
          {
            name: "Reason",
            value: "Spamming in chat",
            inline: true,
          },
          {
            name: "Time Duration",
            value: `Timed out for ${prettyMs(parsedDuration)}`,
            inline: true,
          },
          {
            name: "User and Moderator",
            value: `User: ${targetUser} | Moderator: ${interaction.user}`,
            inline: true,
          }
        )
        .setColor("#00f576")
        .setFooter({
          text: "Guarded",
        });

      await interaction.editReply({ embeds: [timeoutWorks] });
    } catch (error) {
      await interaction.editReply(
        `There was an error with timing out that user. This is most likely a problem with the bot itself. If this is a recurring problem, contact a developer and give them the 'Error Information'. Error Information: ${error}`
      );
    }
  },

  name: "timeout",
  description: "Choose a user to timeout.",
  options: [
    {
      name: "time",
      description: "How long should I timeout the user? (Ex: 1h, 3d, None)",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
    {
      name: "user",
      description: "Who should I timeout?",
      required: true,
      type: ApplicationCommandOptionType.User,
    },
    {
      name: "reason",
      description: "Why should I timeout this user?",
      required: false,
      type: ApplicationCommandOptionType.String,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.ModerateMembers],
  botPermissions: [PermissionFlagsBits.ModerateMembers],
  // devOnly: Boolean,
  // testOnly: Boolean,
  // deleted: Boolean,
  // permissionsAny: [PermissionFlagsBits.PermissionGoesHere],

  /* 
  Permissions Any vs Permissions Required

  Permissions Any will check if the user has *any* of the specified permissions.
  Permissions Required will check if the user has *all* of the specified permissions.
  */
};

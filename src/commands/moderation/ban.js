const {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  callback: async (client, interaction) => {
    const targetUserId = interaction.options.get("user").value;
    const reason =
      interaction.options.get("reason")?.value || "❓ No Reason Provided";

    await interaction.deferReply({ ephemeral: true });

    let targetUser;
    try {
      targetUser = await interaction.guild.members.fetch(targetUserId);
    } catch {
      const cantFindEmbed = new EmbedBuilder()
        .setColor(0xe03a3a)
        .setTitle("❓ User Not Found ❓")
        .setDescription("I couldn't find that member in this server.")
        .setFooter({ text: "Guarded" });

      await interaction.editReply({ embeds: [cantFindEmbed] });
      return;
    }

    if (targetUser.id === interaction.guild.ownerId) {
      const serverOwnerEmbed = new EmbedBuilder()
        .setColor(0x2358de)
        .setTitle("🛡️ Server Owner 🛡️")
        .setDescription("You can't ban the server owner.")
        .setFooter({ text: "Guarded" });

      await interaction.editReply({ embeds: [serverOwnerEmbed] });
      return;
    }

    const targetUserRolePosition = targetUser.roles.highest.position;
    const requestUserRolePosition = interaction.member.roles.highest.position;
    const botRolePosition = interaction.guild.members.me.roles.highest.position;

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
          "There was a problem with banning that user. They have the same or higher role than me. Contact a server administrator to fix this."
        )
        .setFooter({ text: "Guarded" });

      await interaction.editReply({ embeds: [botMissingPermsEmbed] });
      return;
    }

    try {
      await targetUser.ban({ reason });

      const banSuccessEmbed = new EmbedBuilder()
        .setTitle("✅ Ban Successful ✅")
        .addFields(
          {
            name: "Reason",
            value: reason,
            inline: true,
          },
          {
            name: "User and Moderator",
            value: `User: ${targetUser} | Moderator: ${interaction.user}`,
            inline: true,
          }
        )
        .setColor("#00f576")
        .setFooter({ text: "Guarded" });

      await interaction.editReply({ embeds: [banSuccessEmbed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setColor(0xe03a3a)
        .setTitle("🤖 Error Banning User 🤖")
        .setDescription(
          "There was an error banning that user. Please try again later."
        )
        .setFooter({ text: "Guarded" });

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },

  name: "ban",
  description: "Bans a user from the server.",
  options: [
    {
      name: "user",
      description: "Who do I need to ban?",
      required: true,
      type: ApplicationCommandOptionType.User,
    },
    {
      name: "reason",
      description: "Why should I ban this person?",
      required: false,
      type: ApplicationCommandOptionType.String,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.BanMembers],
  botPermissions: [PermissionFlagsBits.BanMembers],
};

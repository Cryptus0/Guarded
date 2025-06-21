const { devs, testServer } = require("../../../config.json");
const { permissionsAny } = require("../../commands/utility/slowmode");
const getLocalCommands = require("../../utils/getLocalCommands");
const { EmbedBuilder } = require("discord.js");

module.exports = async (client, interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const localCommands = getLocalCommands();

  try {
    const commandObject = localCommands.find(
      (cmd) => cmd.name === interaction.commandName
    );

    if (!commandObject) return;

    if (commandObject.devOnly) {
      if (!devs.includes(interaction.member.id)) {
        const devOnlyEmbed = new EmbedBuilder()
          .setColor(0xeb8634)
          .setTitle("🛠️ Developer Command 🛠️")
          .setDescription("This command is for developers only.")
          .setFooter({ text: "Guarded" });

        interaction.reply({ embeds: [devOnlyEmbed] });
        return;
      }
    }

    if (commandObject.testOnly) {
      if (!(interaction.guild.id === testServer)) {
        const testServerEmbed = new EmbedBuilder()
          .setColor(0xeb4949)
          .setTitle("🦺 Test Server Command 🦺")
          .setDescription("You can't run this command here.")
          .setFooter({ text: "Guarded" });

        interaction.reply({ embeds: [testServerEmbed] });
        return;
      }
    }

    if (commandObject.permissionsRequired?.length) {
      for (const permission of commandObject.permissionsRequired) {
        if (!interaction.member.permissions.has(permission)) {
          const missingPermissionsEmbed = new EmbedBuilder()
            .setColor(0x254fd9)
            .setTitle("🛡️ Missing Permissions 🛡️")
            .setDescription(
              "You are missing the necessary permissions needed to run this command."
            )
            .setFooter({ text: "Guarded" });

          interaction.reply({ embeds: [missingPermissionsEmbed] });
          return;
        }
      }
    }

    if (commandObject.permissionsAny?.length) {
      const hasAnyPermission = permissionsAny.some((perm) =>
        interaction.member.permissions.has(perm)
      );

      for (const permission of commandObject.permissionsAny) {
        if (!hasAnyPermission) {
          const missingPermissionsEmbed = new EmbedBuilder()
            .setColor(0x254fd9)
            .setTitle("🛡️ Missing Permissions 🛡️")
            .setDescription(
              "You are missing the necessary permissions needed to run this command."
            )
            .setFooter({ text: "Guarded" });

          interaction.reply({ embeds: [missingPermissionsEmbed] });
          return;
        }
      }
    }

    if (commandObject.botPermissions?.length) {
      for (const permission of commandObject.botPermissions) {
        const bot = interaction.guild.members.me;

        if (!bot.permissions.has(permission)) {
          const botMissingPermsEmbed = new EmbedBuilder()
            .setColor(0x254fd9)
            .setTitle("🤖 Missing Permissions 🤖")
            .setDescription(
              "I am missing the necessary permissions needed to run this command. Contact a server administrator to fix this issue."
            )
            .setFooter({ text: "Guarded" });

          interaction.reply({ embeds: [botMissingPermsEmbed] });
          return;
        }
      }
    }

    await commandObject.callback(client, interaction);
  } catch (error) {
    const errorEmbed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle("❌ Bot Error ❌")
      .setDescription(
        `We're having issues running this command. If this is a recurring problem, contact a developer. Error Information: ${error}`
      )
      .setFooter({ text: "Guarded" });

    interaction.reply({ embeds: [errorEmbed] });
    return;
  }
};

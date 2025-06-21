const { EmbedBuilder } = require("discord.js");
const { notifyDevs } = require("../../handlers/notifyDevs");

module.exports = {
  name: "ping",
  description: "Receive the bot's latency to Discord's API.",

  callback: async (client, interaction) => {
    const wsPing = client.ws.ping;
    const sent = Date.now();

    try {
      await interaction.reply({
        content: "Pinging...",
        fetchReply: true,
        ephemeral: true, // hide initial message
      });

      const latency = Date.now() - sent;

      if (wsPing === -1) {
        const commandError = new EmbedBuilder()
          .setColor(0xff333f)
          .setTitle("❌ Command Error ❌")
          .setDescription(`This command failed to run. Try again later.`)
          .setFooter({ text: "Guarded" });

        return interaction.editReply({ content: "", embeds: [commandError] });
      }

      // Adjusted severity thresholds for more realistic latencies
      const getSeverity = (ms, isWs = false) => {
        if (isWs) {
          // WebSocket ping: stricter thresholds since it’s usually low
          if (ms > 500) return 4;
          if (ms > 250) return 3;
          if (ms > 100) return 2;
          return 1;
        } else {
          // Message latency: higher thresholds because it's naturally higher
          if (ms > 600) return 4;
          if (ms > 400) return 3;
          if (ms > 250) return 2;
          return 1;
        }
      };

      const wsSeverity = getSeverity(wsPing, true);
      const msgSeverity = getSeverity(latency, false);
      const severity = Math.max(wsSeverity, msgSeverity);

      // Add custom code here based on severity
      const handleSeverity = (level) => {
        switch (level) {
          case 4:
            // Severe ping actions: e.g. notify devs, log critical, throttle commands, etc.
            console.warn("[PING SEVERE] Major latency detected:", { wsPing, latency });
            notifyDevs(`[PING SEVERE] Major latency detected\n\nWebSocket: ${wsPing}ms\nMessage Latency: ${latency}ms`)
            break;
          case 3:
            // High ping actions: e.g. log warning, alert team, maybe limit features temporarily
            console.warn("[PING HIGH] Noticeable latency:", { wsPing, latency });
            notifyDevs(`[PING HIGH] Major latency detected\n\nWebSocket: ${wsPing}ms\nMessage Latency: ${latency}ms`)
            break;
          case 2:
            // Medium ping: usually no action needed
            break;
          case 1:
          default:
            // Good ping: usually no action needed
            break;
        }
      };

      handleSeverity(severity);

      let embed;

      switch (severity) {
        case 4:
          embed = new EmbedBuilder()
            .setColor(0xf44336)
            .setTitle("❗ Severe Ping ❗")
            .setDescription(
              `WebSocket ping: **${wsPing}ms**\nMessage latency: **${latency}ms**\n\nThe bot may experience major stutters and command latency. This has automatically been reported to the developer team.`
            )
            .setFooter({ text: "Guarded" });
          break;
        case 3:
          embed = new EmbedBuilder()
            .setColor(0xff8200)
            .setTitle("⚠️ High Ping ⚠️")
            .setDescription(
              `WebSocket ping: **${wsPing}ms**\nMessage latency: **${latency}ms**\n\nThe bot may experience some stutters and command latency.`
            )
            .setFooter({ text: "Guarded" });
          break;
        case 2:
          embed = new EmbedBuilder()
            .setColor(0xf1c232)
            .setTitle("⚠️ Medium Ping ⚠️")
            .setDescription(
              `WebSocket ping: **${wsPing}ms**\nMessage latency: **${latency}ms**\n\nThe bot may experience minor stutters and command latency.`
            )
            .setFooter({ text: "Guarded" });
          break;
        case 1:
        default:
          embed = new EmbedBuilder()
            .setColor(0x3ae058)
            .setTitle("✅ Good Ping ✅")
            .setDescription(
              `WebSocket ping: **${wsPing}ms**\nMessage latency: **${latency}ms**\n\nIf the bot is still laggy, you may need to contact our support team to notify a developer.`
            )
            .setFooter({ text: "Guarded" });
          break;
      }

      await interaction.editReply({ content: "", embeds: [embed] });

    } catch (error) {
      console.error("Ping command error:", error);
    }
  },
};

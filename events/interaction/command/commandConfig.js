import { Events } from "discord.js";
import axios from "axios";
import { logger } from "../../../functions/logger";
const BOT_ID = process.env.BOT_ID;

export const commandConfigInit = (clientItem) => {
  const client = clientItem;

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const { commandName } = interaction;

    if (commandName === "setup") {
      try {
        const guild = interaction.guildId;
        const channel = interaction.options.getChannel("channel").id;
        const role = interaction.options.getRole("role").id;

        const registerSetup = await axios({
          method: "post",
          url: "http://localhost:3000/setup/",
          headers: {
            statyid: BOT_ID,
          },
          data: {
            guild: guild,
            channel: channel,
            role: role,
          },
        });

        await interaction.reply({
          content: "Your setup is ready",
          ephemeral: true,
        });
      } catch (error) {
        logger(`🔴 [setup:global:config_command] API Call : ${error}`);
      }
    }
  });
};

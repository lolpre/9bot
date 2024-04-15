import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { getNthForm, getAuth } from "@/utils/forms";

const getLink = {
  data: new SlashCommandBuilder()
    .setName("link")
    .setDescription("Gets the link to the most recent issue"),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const auth = getAuth();
    const form = await getNthForm({ auth });
    if (!form || !form.responderUri) {
      await interaction.followUp("No forms found!");
      return;
    }
    await interaction.followUp(`${form.responderUri}`);
    return;
  },
};

export default getLink;

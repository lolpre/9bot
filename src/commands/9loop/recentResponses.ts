import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import {
  getMostRecentForm,
  getFormattedResponses,
  getAuth,
  SHARED_FOLDER_ID,
} from "@/utils/forms";

const printRecentResponses = {
  data: new SlashCommandBuilder()
    .setName("responses")
    .setDescription(
      "Prints responses to the most recent google form (test command)",
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const auth = getAuth();
    const form = await getMostRecentForm({ auth, folderId: SHARED_FOLDER_ID });
    if (!form) {
      await interaction.followUp("No form found");
      return;
    }
    const responses = await getFormattedResponses({ auth, form });
    if (!responses) {
      await interaction.followUp("No responses found");
      return;
    }
    for (const response of responses) {
      await interaction.followUp(
        `\`\`\`${JSON.stringify(response, null, 2)}\`\`\``,
      );
    }
    return;
  },
};

export default printRecentResponses;

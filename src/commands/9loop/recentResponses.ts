import {
  EmbedBuilder,
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import {
  getMostRecentForm,
  getFormattedResponses,
  getAuth,
} from "@/utils/forms";
import { FormResponse } from "@/utils/types";

const createEmbed = (res: FormResponse) => {
  const embed = new EmbedBuilder()
    .setColor(0xff0077)
    .setTitle(`${res.author}`)
    .setAuthor({ name: "9bot" })
    .setTimestamp()
    .setFooter({ text: "9bot!!! 😼" });

  for (const answers of res.answers) {
    embed.addFields({
      name: `${answers.question}`,
      value: `${answers.answer}`,
    });
  }

  return embed;
};

const printRecentResponses = {
  data: new SlashCommandBuilder()
    .setName("responses")
    .setDescription(
      "Prints responses to the most recent google form (test command)",
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const auth = getAuth();
    const form = await getMostRecentForm({ auth });
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
      await interaction.followUp({ embeds: [createEmbed(response)] });
    }
    return;
  },
};

export default printRecentResponses;

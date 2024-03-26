import {
  EmbedBuilder,
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ColorResolvable,
} from "discord.js";
import {
  getMostRecentForm,
  getFormattedResponses,
  getAuth,
} from "@/utils/forms";
import { FormResponse } from "@/utils/types";

const colors: ColorResolvable[] = [
  0xed8796, 0xee99a0, 0xf5a97f, 0xeed49f, 0xa6da95, 0x8bd5ca, 0x91d7e3,
  0x7dc4e4, 0x8aadf4, 0xb7bdf8,
];

const createEmbed = (responses: FormResponse[]) => {
  const embeds: { [key: string]: EmbedBuilder } = {};
  let i = 0;

  responses[0].answers.forEach((answer) => {
    embeds[answer.questionId] = new EmbedBuilder()
      .setColor(colors[i % colors.length])
      .setTitle(`${answer.question}`);
    i++;
  });

  responses.forEach((res) => {
    res.answers.forEach((answer) => {
      embeds[answer.questionId].addFields({
        name: `${res.author}`,
        value: `${answer.answer}`,
      });
    });
  });

  return Object["values"](embeds);
};

const printRecentResponses = {
  data: new SlashCommandBuilder()
    .setName("responses")
    .setDescription(
      "Prints responses to the most recent google form (test command)"
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
    // for (const response of responses) {
    //   await interaction.followUp({ embeds: [createEmbed(response)] });
    // }
    await interaction.followUp({ embeds: createEmbed(responses) });
    return;
  },
};

export default printRecentResponses;

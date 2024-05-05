import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  Embed,
} from "discord.js";
import {
  getAuth,
  getFormattedResponses,
  getForm,
  getNthForm,
  countGoogleForms,
} from "../../utils/forms";
import { StringUtils } from "turbocommons-ts";
import { PHOTO_QUESTION } from "@/defaults";

const photowall = {
  data: new SlashCommandBuilder()
    .setName("photowall")
    .setDescription("Creates a photowall pulled from the form responses")
    .addIntegerOption((option) =>
      option
        .setName("n")
        .setDescription(
          "The issue number to upload. Don't set to get the most recent photowall"
        )
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const auth = getAuth();
    let formId = null;
    const nInput = interaction.options.getInteger("n");
    const numGoogleForms = countGoogleForms({ auth });
    if (!nInput) {
      formId = (await numGoogleForms) - 1;
    } else if (nInput == (await numGoogleForms)) {
      await interaction.followUp("No peaking >:)");
      return;
    } else {
      formId = nInput;
    }
    const form = await getNthForm({
      auth,
      n: formId ?? undefined,
    });
    if (!form) {
      await interaction.followUp("Failed to find form");
      return;
    }
    const responses = await getFormattedResponses({ auth, form });
    if (!responses) {
      await interaction.followUp("Failed to find responses");
      return;
    }
    const embedList: EmbedBuilder[] = [];
    responses.forEach((response) => {
      response.answers.forEach(({ questionId, question, answer }) => {
        if (question == PHOTO_QUESTION.question && answer) {
          let embed = null;
          if (StringUtils.isUrl(answer)) {
            embed = new EmbedBuilder()
              .setTitle(response.author!)
              .setImage(answer)
              .setDescription(answer);
          } else {
            embed = new EmbedBuilder()
              .setTitle(response.author!)
              .setDescription(answer);
          }
          embedList.push(embed);
        }
      });
    });
    if (embedList.length != 0) {
      await interaction.followUp({ embeds: embedList });
      return;
    }
    await interaction.followUp("Failed to create embeds");
    return;
  },
};

export default photowall;

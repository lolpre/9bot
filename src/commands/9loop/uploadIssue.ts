import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { getNthForm, getAuth, countGoogleForms } from "@/utils/forms";
import { uploadIssue } from "@/utils/github";

const uploadIssueCommand = {
  data: new SlashCommandBuilder()
    .setName("upload_issue")
    .setDescription("Manually upload a newsletter isssue")
    .addIntegerOption((option) =>
      option
        .setName("n")
        .setDescription("The issue number to upload")
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const auth = getAuth();

    const n = interaction.options.getInteger("n");
    const form = await getNthForm({
      auth,
      n: n ?? undefined,
    });
    if (!form) {
      await interaction.followUp("Faled to find form");
      return;
    }

    const issueNo = n ?? (await countGoogleForms({ auth })) + 1;
    const response = await uploadIssue({
      auth,
      formId: form.formId!,
      issueNo,
    });

    if (response) {
      await interaction.followUp(
        `New 9Loop Newsletter issue @everyone: https://lolpre.github.io/9bot/`
      );
      return;
    }

    await interaction.followUp(
      `Failed to upload issue #${issueNo}, check da logs`
    );
    return;
  },
};

export default uploadIssueCommand;

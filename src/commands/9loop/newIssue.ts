import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import {
  getMostRecentForm,
  getFormattedResponses,
  getAuth,
  getNewQuestions,
  createForm,
  countGoogleForms,
} from "@/utils/forms";
import { format } from "date-fns";

const newIssue = {
  data: new SlashCommandBuilder()
    .setName("new_issue")
    .setDescription("Manually create a new newsletter isssue (test command)"),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    let responses = undefined;

    const dateStr = format(new Date(), "MMMM do, yyyy");

    const auth = getAuth();

    const mostRecentForm = await getMostRecentForm({
      auth,
    });
    if (mostRecentForm) {
      console.log("Found most recent form", mostRecentForm.formId);
      responses = await getFormattedResponses({ auth, form: mostRecentForm });
    }

    const issueNumber = (await countGoogleForms({ auth })) + 1;

    const form = await createForm({
      auth,
      title: `9Loop Newsletter`,
      fileName: `9loop_issue_${issueNumber}`,
      questions: getNewQuestions(responses),
      description: `Issue No.${issueNumber} · ${dateStr}`,
    });

    if (!form.form?.responderUri) {
      await interaction.followUp("Failed to create form");
      return;
    }

    await interaction.followUp(
      `Successfully created 9Loop Newsletter Issue #${issueNumber}. Link: ${form.form?.responderUri}`
    );
    return;
  },
};

export default newIssue;

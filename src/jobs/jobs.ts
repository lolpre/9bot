import {
  getMostRecentForm,
  getFormattedResponses,
  getAuth,
  getNewQuestions,
  createForm,
  countGoogleForms,
} from "@/utils/forms";
import { format } from "date-fns";
import { uploadIssue } from "@/utils/github";
import { client } from "@/index";
import { TextChannel } from "discord.js";
import { NINE } from "@/defaults";

const NEWSLETTER_CHANNEL_ID = "1216603509051359302";

export async function jobWrapper(name: string, fn: () => Promise<void>) {
  try {
    console.log(`Running job: ${name}`);
    await fn();
  } catch (error) {
    console.error(`Error in ${name}:`, error);
    const channel = client.channels.cache.get(NEWSLETTER_CHANNEL_ID);
    if (channel instanceof TextChannel) {
      channel.send(
        `Failed to create new questionnaire. Check the logs. @everyone`
      );
    }
  }
}

//TODO: send a reminder to  everyone to fill out the form
//should check if the form is filled out by x user and if not send a reminder
export async function reminder() {
  const auth = getAuth();
  const mostRecentForm = await getMostRecentForm({
    auth,
  });

  NINE.forEach(async (userId) => {
    // if user has not filled out the form, send a reminder
  });
}

export async function createNextForm() {
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

  const response = await createForm({
    auth,
    title: `9Loop Newsletter Questionnaire`,
    fileName: `9loop_issue_${issueNumber.toString().padStart(3, "0")}`,
    questions: getNewQuestions(responses),
    description: `Issue No.${issueNumber} · ${dateStr}`,
  });

  const channel = client.channels.cache.get(NEWSLETTER_CHANNEL_ID);
  if (response && channel instanceof TextChannel) {
    // TODO: make this a cool embed
    channel.send(
      `New 9Loop Newsletter Questionnaire @everyone: ${response.form?.responderUri}`
    );
  }
}

export async function uploadCurrentIssue() {
  const auth = getAuth();
  const mostRecentForm = await getMostRecentForm({
    auth,
  });
  if (!mostRecentForm) {
    console.error("No form found");
    return;
  }
  const issueNumber = await countGoogleForms({ auth });

  const response = await uploadIssue({
    auth,
    formId: mostRecentForm.formId!,
    issueNo: issueNumber,
  });

  const channel = client.channels.cache.get(NEWSLETTER_CHANNEL_ID);
  if (response.status === 200 && channel instanceof TextChannel) {
    // TODO: make this a cool embed
    channel.send(
      `New 9Loop Newsletter issue @everyone: https://lolpre.github.io/9bot/`
    );
  }
}

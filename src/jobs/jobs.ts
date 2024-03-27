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
import { ColorResolvable, EmbedBuilder, TextChannel } from "discord.js";
import { NINE, NINE_DIC } from "@/defaults";
import { findClosestName } from "@/utils/namematch";

const NEWSLETTER_CHANNEL_ID = "1216603509051359302";
const REMINDER_CHANNEL_ID = "1221680140405313536";

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
  const channel = client.channels.cache.get(REMINDER_CHANNEL_ID) as TextChannel;

  const form = await getMostRecentForm({ auth });
  if (!form) {
    channel.send("No form created");
    return;
  }

  const formResponses = await getFormattedResponses({ auth, form });
  if (!formResponses) {
    const embed = new EmbedBuilder()
      .setColor("#FF0000" as ColorResolvable)
      .setTitle(
        `No one turned in anything yet, @everyone ${mostRecentForm?.responderUri}`
      )
      .setImage("https://c.tenor.com/uqoIIeQcPrwAAAAd/break-dancing-ass.gif");
    channel.send({ embeds: [embed] });
    return;
  }

  const allNames: string[] = [
    "jp",
    "joshy",
    "korean",
    "kenen",
    "chromebook",
    "nathan",
    "naykun",
    "boyu",
    "alex",
    "ethan",
    "yeeb",
    "julian",
    "jthemage",
    "j",
    "vincent",
    "vin",
    "sri",
    "harsha",
    "tango",
    "sandwich",
    "dean",
    "white",
  ];

  const participants = formResponses.map((response) =>
    findClosestName(response.author!, allNames)
  );
  const nonParticipants = Object.keys(NINE_DIC).filter(
    (item) => !participants.includes(item)
  );
  const nonParticipantsTags = nonParticipants.map(
    (nonParticipant) => "<@" + NINE_DIC[nonParticipant] + ">"
  );
  if (nonParticipants.length > 0) {
    const embed = new EmbedBuilder()
      .setColor("#FF0000" as ColorResolvable)
      .setTitle(`Get your shit in: `)
      .setDescription(
        `${nonParticipantsTags.join(",")}\n${mostRecentForm?.responderUri}`
      )
      .setImage("https://c.tenor.com/uqoIIeQcPrwAAAAd/break-dancing-ass.gif");
    channel.send({ embeds: [embed] });
    console.log(nonParticipants);
  }
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

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function renderLog() {
  const date = new Date();
  console.log("%s: I'm awake!", date);
}

export async function renderLog2() {
  const date = new Date();
  // waits 30 seconds
  await delay(30000);
  console.log("%s: I'm awake!", date);
}

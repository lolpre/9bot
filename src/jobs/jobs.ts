import {
  getNthForm,
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
import { calculateDaysUntil1stOr15th } from "@/utils/remainingday";

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
  const mostRecentForm = await getNthForm({
    auth,
  });
  const channel = client.channels.cache.get(REMINDER_CHANNEL_ID) as TextChannel;

  const form = await getNthForm({ auth });
  if (!form) {
    channel.send("No form created");
    return;
  }

  // calculate day until submission date
  const daysUntil1stOr15th = calculateDaysUntil1stOr15th(new Date());

  const formResponses = await getFormattedResponses({ auth, form });
  if (!formResponses) {
    const embed = new EmbedBuilder()
      .setColor("#FF0000" as ColorResolvable)
      .setTitle(`No one turned in anything yet`)
      .setDescription(`${daysUntil1stOr15th} days until due date!`)
      .setImage("https://c.tenor.com/uqoIIeQcPrwAAAAd/break-dancing-ass.gif");
    channel.send({ embeds: [embed] });
    channel.send(`@everyone ${mostRecentForm?.responderUri}`);
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
      .setTitle(`Get your shit in!`)
      .setDescription(`${daysUntil1stOr15th} days until due date!`)
      .setImage("https://c.tenor.com/uqoIIeQcPrwAAAAd/break-dancing-ass.gif");
    channel.send({ embeds: [embed] });
    channel.send(
      `${nonParticipantsTags.join(",")}\n${mostRecentForm?.responderUri}`
    );
    console.log(nonParticipants);
  }

  // Dm everyone
  nonParticipants.forEach((name: string) => {
    const userId = NINE_DIC[name];
    client.users.fetch(userId).then((user) => {
      user.send(
        `Get your shit in! ${daysUntil1stOr15th} days until due date!\n${mostRecentForm?.responderUri}`
      );
    });
  });
}

export async function createNextForm() {
  let responses = undefined;
  const dateStr = format(new Date(), "MMMM do, yyyy");

  const auth = getAuth();

  const mostRecentForm = await getNthForm({
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
  const mostRecentForm = await getNthForm({
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
  if (response && channel instanceof TextChannel) {
    // TODO: make this a cool embed
    channel.send(
      `New 9Loop Newsletter issue @everyone: https://lolpre.github.io/9bot/`
    );
  }
}

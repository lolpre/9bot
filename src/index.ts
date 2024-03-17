import { Client, Collection, GatewayIntentBits } from "discord.js";
import config from "../config.json";
import fs from "fs";
import path from "path";
import Datastore from "@seald-io/nedb";
import { QuestionBank } from "./backend/db";
import { Question, DEFAULT_QUESTIONS } from "./utils/types";
import { CronJob } from "cron";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

// Load db
const db = new Datastore(); // TODO: Migrate to sqlite (or any static db file) once Julian server is set up
db.loadDatabase();
const questionBank = new QuestionBank(db);

// TODO: integrate with google forms api or discord modal
// Example db usage. Comment out to test
// (async () => {
//   await questionBank.insert_question(DEFAULT_QUESTIONS[0]);
//   const doc = await questionBank.get_question("🥺️👉👈 name pls");
//   console.log(doc);
// })();

// TODO: Create CronJob manager to manage all cronjobs
const cronJob = new CronJob("* * * * *", async () => {
  try {
    await console.log("every minute");
  } catch (e) {
    console.error(e);
  }
});
// Start job
if (!cronJob.running) {
  cronJob.start();
}

const handlersDir = path.join(__dirname, "./handlers");
fs.readdirSync(handlersDir).forEach((handler) => {
  if (!handler.endsWith(".js") && !handler.endsWith(".ts")) return;
  require(`${handlersDir}/${handler}`)(client);
});

// Log in to Discord with your client's token
client.login(config.token);

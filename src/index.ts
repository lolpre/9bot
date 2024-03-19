import { Client, Collection, GatewayIntentBits } from "discord.js";
import config from "../config.json";
import fs from "fs";
import path from "path";
import { initJobs } from "@/jobs/index";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions
  ]
});
client.commands = new Collection();

const handlersDir = path.join(__dirname, "./handlers");
fs.readdirSync(handlersDir).forEach((handler) => {
  if (!handler.endsWith(".js") && !handler.endsWith(".ts")) return;
  require(`${handlersDir}/${handler}`)(client);
});

// Log in to Discord with your client's token
client.login(config.token).then(() => {
  initJobs();
});

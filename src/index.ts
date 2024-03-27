import { Client, Collection, GatewayIntentBits } from "discord.js";
import fs from "fs";
import path from "path";
import { initJobs } from "@/jobs/index";
import dotenv from "dotenv";

dotenv.config();

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
  ],
});
client.commands = new Collection();

const handlersDir = path.join(__dirname, "./handlers");
fs.readdirSync(handlersDir).forEach((handler) => {
  if (!handler.endsWith(".js") && !handler.endsWith(".ts")) return;
  require(`${handlersDir}/${handler}`)(client);
});

// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN).then(() => {
  initJobs();
});

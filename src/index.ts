import { Client, Collection, GatewayIntentBits } from "discord.js";
import config from "../config.json";
import fs from "fs";
import path from "path";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const handlersDir = path.join(__dirname, "./handlers");
fs.readdirSync(handlersDir).forEach((handler) => {
  if (!handler.endsWith(".js") && !handler.endsWith(".ts")) return;
  require(`${handlersDir}/${handler}`)(client);
});

// Log in to Discord with your client's token
client.login(config.token);
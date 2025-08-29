import { Client, GatewayIntentBits } from "discord.js";
import { MusicManager } from "./MusicManager";
import fs from "fs";
import path from "path";
import { Command } from "./Command";

export class Bot {
  public client: Client;
  public music: MusicManager;
  public commands: Command[] = [];

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.music = new MusicManager(this.client);
    (this.client as any).music = this.music;

    this.loadCommands();
    this.loadEvents();
  }

  private loadCommands(dir: string = path.join(__dirname, "../commands")) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        this.loadCommands(fullPath); // recurse into subfolders
        continue;
      }

      if (!file.endsWith(".ts") && !file.endsWith(".js")) continue;

      const imported = require(fullPath);
      const CommandClass =
        imported.default || imported[Object.keys(imported)[0]];

      if (typeof CommandClass !== "function") continue;

      const command: Command = new CommandClass();
      this.commands.push(command);
    }
  }

  private loadEvents() {
    const eventsPath = path.join(__dirname, "../events");
    const files = fs.readdirSync(eventsPath);

    for (const file of files) {
      if (!file.endsWith(".ts") && !file.endsWith(".js")) continue;

      const eventHandler = require(path.join(eventsPath, file)).default;
      const eventName = file.split(".")[0].toLowerCase();

      if (!eventHandler) continue;

      if (eventName === "messagecreate") {
        this.client.on("messageCreate", (msg) =>
          eventHandler(msg, this.commands)
        );
      } else if (eventName === "ready") {
        this.client.once("ready", () => eventHandler(this.client));
      } else {
        this.client.on(eventName, (...args) => eventHandler(...args));
      }
    }
  }

  public async start() {
    if (!process.env.DISCORD_TOKEN) {
      console.error("❌ DISCORD_TOKEN missing in .env");
      process.exit(1);
    }
    await this.client.login(process.env.DISCORD_TOKEN);
  }
}

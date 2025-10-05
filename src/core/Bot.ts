import {
  Client,
  GatewayIntentBits,
  Collection,
  REST,
  Routes,
} from 'discord.js';
import { MusicManager } from './MusicManager';
import fs from 'fs';
import path from 'path';
import { Command } from './Command';

export class Bot {
  public client: Client;
  public music: MusicManager;
  public commands: Collection<string, Command> = new Collection();

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
    this.setupInteractionHandler();
  }

  private loadCommands(dir: string = path.join(__dirname, '../commands')) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        this.loadCommands(fullPath); // recurse into subfolders
        continue;
      }

      if (!file.endsWith('.ts') && !file.endsWith('.js')) continue;

      const imported = require(fullPath);
      const CommandClass =
        imported.default || imported[Object.keys(imported)[0]];

      if (typeof CommandClass !== 'function') continue;

      const command: Command = new CommandClass();
      this.commands.set(command.name, command);
    }
  }

  private loadEvents() {
    const eventsPath = path.join(__dirname, '../events');
    const files = fs.readdirSync(eventsPath);

    for (const file of files) {
      if (!file.endsWith('.ts') && !file.endsWith('.js')) continue;

      const eventHandler = require(path.join(eventsPath, file)).default;
      const eventName = file.split('.')[0].toLowerCase();

      if (!eventHandler) continue;

      if (eventName === 'ready') {
        this.client.once('ready', () => eventHandler(this.client));
      } else {
        this.client.on(eventName, (...args) => eventHandler(...args));
      }
    }
  }

  private setupInteractionHandler() {
    this.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      const command = this.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error('Error executing command:', error);
        const errorMessage = {
          content: 'There was an error while executing this command!',
          ephemeral: true,
        };

        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(errorMessage);
        } else {
          await interaction.reply(errorMessage);
        }
      }
    });
  }

  private async registerSlashCommands() {
    if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID) {
      console.error('❌ DISCORD_TOKEN or CLIENT_ID missing in .env');
      process.exit(1);
    }

    const commandsData = Array.from(this.commands.values()).map((command) =>
      command.data.toJSON()
    );

    const rest = new REST({ version: '10' }).setToken(
      process.env.DISCORD_TOKEN
    );

    try {
      console.log('🔄 Refreshing slash commands...');

      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
        body: commandsData,
      });

      console.log('✅ Successfully registered slash commands!');
    } catch (error) {
      console.error('❌ Error registering slash commands:', error);
    }
  }

  public async start() {
    if (!process.env.DISCORD_TOKEN) {
      console.error('❌ DISCORD_TOKEN missing in .env');
      process.exit(1);
    }

    await this.client.login(process.env.DISCORD_TOKEN);
    await this.registerSlashCommands();
  }
}

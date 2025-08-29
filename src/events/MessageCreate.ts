import { Message } from "discord.js";
import { Command } from "@/core/Command";

export default async (message: Message, commands: Command[]) => {
  if (message.author.bot || !message.guild) return;

  const [cmd, ...args] = message.content.trim().split(/\s+/);
  if (!cmd.startsWith("!")) return;

  const command = commands.find(
    (c) =>
      c.name === cmd.slice(1).toLowerCase() ||
      c.aliases.includes(cmd.slice(1).toLowerCase())
  );

  if (command) {
    await command.execute(message, args);
  }
};

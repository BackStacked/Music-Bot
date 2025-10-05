import { Message } from 'discord.js';

export default async (message: Message) => {
  // No longer handling text commands since we're using slash commands
  // This event can be used for other message-related functionality if needed
  if (message.author.bot || !message.guild) return;
};

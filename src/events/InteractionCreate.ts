import { Interaction } from 'discord.js';

export default async (interaction: Interaction) => {
  // Interaction handling is now done in the Bot class
  // This event handler is left for potential future use
  if (!interaction.isChatInputCommand()) return;
};

import { Command } from '@/core/Command';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export class PauseCommand extends Command {
  public name = 'pause';
  public data = new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pause or resume the current track');

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const player = (interaction.client as any).music.manager.players.get(
      interaction.guild!.id
    );

    if (!player) {
      await interaction.reply('❌ No active player.');
      return;
    }
    if (player.paused) {
      player.pause(false); // This resumes playback
      await interaction.reply('▶️ Resumed!');
    } else {
      player.pause(true); // This pauses playback
      await interaction.reply('⏸️ Paused!');
    }
  }
}

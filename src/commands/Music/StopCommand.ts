import { Command } from '@/core/Command';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export class StopCommand extends Command {
  public name = 'stop';
  public data = new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop playback and disconnect from voice channel');

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const player = (interaction.client as any).music.manager.players.get(
      interaction.guild!.id
    );

    if (!player) {
      await interaction.reply('❌ No active player.');
      return;
    }

    player.destroy();
    await interaction.reply('🛑 Stopped and disconnected.');
  }
}

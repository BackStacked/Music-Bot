import { Command } from '@/core/Command';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export class SkipCommand extends Command {
  public name = 'skip';
  public data = new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip the current track');

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const player = (interaction.client as any).music.manager.players.get(
      interaction.guild!.id
    );

    if (!player) {
      await interaction.reply('❌ No active player.');
      return;
    }

    if (!player.queue.current) {
      await interaction.reply('❌ Nothing is currently playing.');
      return;
    }

    player.stop();
    await interaction.reply('⏭️ Skipped!');
  }
}

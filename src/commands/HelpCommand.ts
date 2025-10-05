import { Command } from '@/core/Command';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { BotEmbed } from '@/core/Embed';

export class HelpCommand extends Command {
  public name = 'help';
  public data = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all available commands');

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const commands = [
      '`/play <song>` - Play a song',
      '`/skip` - Skip current song',
      '`/stop` - Stop and disconnect',
      '`/queue` - Show queue',
      '`/pause` - Pause/Resume playback',
      '`/volume [level]` - Set or show volume',
      '`/loop [mode]` - Toggle loop mode',
      '`/filter [type]` - Apply audio filters',
      '`/controller` - Show music controller',
      '`/help` - Show this message',
    ];

    const embed = new BotEmbed('📖 Help Menu', commands.join('\n'));
    await interaction.reply({ embeds: [embed] });
  }
}

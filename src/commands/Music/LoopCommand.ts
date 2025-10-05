import { Command } from '@/core/Command';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { EmbedFactory } from '@/utils/EmbedFactory';

type LoopMode = 'OFF' | 'TRACK' | 'QUEUE';

export class LoopCommand extends Command {
  public name = 'loop';
  public data = new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Set loop mode for the music player')
    .addStringOption((option) =>
      option
        .setName('mode')
        .setDescription('Loop mode')
        .setRequired(false)
        .addChoices(
          { name: 'Off', value: 'off' },
          { name: 'Track', value: 'track' },
          { name: 'Queue', value: 'queue' }
        )
    );

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const validationResult = this.validateCommand(interaction);
    if (validationResult.error) {
      await interaction.reply({
        embeds: [EmbedFactory.error(validationResult.error)],
      });
      return;
    }

    const player = validationResult.player!;
    const currentMode = this.getLoopMode(player);

    let nextMode: LoopMode;

    const modeInput = interaction.options.getString('mode');
    if (modeInput) {
      // If user provided argument, set directly
      if (modeInput === 'off') nextMode = 'OFF';
      else if (modeInput === 'track') nextMode = 'TRACK';
      else if (modeInput === 'queue') nextMode = 'QUEUE';
      else {
        await interaction.reply({
          embeds: [
            EmbedFactory.error(
              'Invalid loop option. Use `off`, `track`, or `queue`.'
            ),
          ],
        });
        return;
      }
    } else {
      // No args -> cycle automatically
      nextMode = this.getNextMode(currentMode);
    }

    // map to Lavalink/erela type values
    const loopMap: Record<LoopMode, string> = {
      OFF: 'none',
      TRACK: 'track',
      QUEUE: 'queue',
    };
    player.setLoop(loopMap[nextMode]);

    await interaction.reply({
      embeds: [
        new EmbedFactory('🔁 Loop Mode Updated')
          .setDescription(
            `Loop mode changed from **${currentMode}** ➝ **${nextMode}**`
          )
          .build(),
      ],
    });
  }

  private validateCommand(interaction: ChatInputCommandInteraction): {
    error?: string;
    player?: any;
  } {
    if (!interaction.guild) {
      return { error: 'This command can only be used in a server.' };
    }

    const player = (interaction.client as any).music?.manager?.players?.get(
      interaction.guild.id
    );
    if (!player) {
      return { error: 'No active player in this server.' };
    }

    return { player };
  }

  private getLoopMode(player: any): LoopMode {
    const repeat = player.loop;
    if (repeat === 'track') return 'TRACK';
    if (repeat === 'queue') return 'QUEUE';
    return 'OFF';
  }

  private getNextMode(current: LoopMode): LoopMode {
    switch (current) {
      case 'OFF':
        return 'TRACK';
      case 'TRACK':
        return 'QUEUE';
      case 'QUEUE':
      default:
        return 'OFF';
    }
  }
}

import { Command } from '@/core/Command';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { EmbedFactory } from '@/utils/EmbedFactory';

export class FilterCommand extends Command {
  public name = 'filter';
  public data = new SlashCommandBuilder()
    .setName('filter')
    .setDescription('Apply audio filters to the music')
    .addStringOption((option) =>
      option
        .setName('type')
        .setDescription('Filter type to apply')
        .setRequired(false)
        .addChoices(
          { name: 'Bassboost', value: 'bassboost' },
          { name: 'Nightcore', value: 'nightcore' },
          { name: 'Vaporwave', value: 'vaporwave' },
          { name: '8D', value: '8d' },
          { name: 'Clear All', value: 'clear' }
        )
    )
    .addIntegerOption((option) =>
      option
        .setName('level')
        .setDescription('Level for bassboost filter (0-5)')
        .setRequired(false)
        .setMinValue(0)
        .setMaxValue(5)
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
    const filters = player.filter; // using FilterManager

    const filterType = interaction.options.getString('type');
    if (!filterType) {
      await interaction.reply({
        embeds: [
          new EmbedFactory('🎛️ Available Filters')
            .setDescription(
              [
                '`bassboost <level>` - boost bass (0–5)',
                '`nightcore` - enable/disable nightcore',
                '`vaporwave` - enable/disable vaporwave',
                '`8d` - enable/disable 8D rotation',
                '`clear` - reset all filters',
              ].join('\n')
            )
            .build(),
        ],
      });
      return;
    }

    switch (filterType) {
      case 'bassboost': {
        const level = interaction.options.getInteger('level') ?? 2;

        const bands = Array(15)
          .fill(0)
          .map((_, i) => ({
            band: i,
            gain: i < 3 ? level * 0.2 : 0, // boost lower frequencies
          }));
        filters.setEqualizer(bands);

        await interaction.reply({
          embeds: [
            new EmbedFactory('🎶 Filter Applied')
              .setDescription(`Bassboost set to **${level}**`)
              .build(),
          ],
        });
        break;
      }

      case 'nightcore':
        filters.setNightcore(!filters.nightcore);
        await interaction.reply({
          embeds: [
            new EmbedFactory('🎶 Filter Applied')
              .setDescription(
                filters.nightcore
                  ? 'Nightcore **enabled** (rate 1.5)'
                  : 'Nightcore **disabled**'
              )
              .build(),
          ],
        });
        break;

      case 'vaporwave':
        filters.setTimescale(
          filters.vaporwave ? null : { pitch: 0.9, rate: 1.0, speed: 0.8 }
        );
        filters.vaporwave = !filters.vaporwave;
        await interaction.reply({
          embeds: [
            new EmbedFactory('🎶 Filter Applied')
              .setDescription(
                filters.vaporwave
                  ? 'Vaporwave **enabled**'
                  : 'Vaporwave **disabled**'
              )
              .build(),
          ],
        });
        break;

      case '8d':
        filters.set8D(!filters.is8D);
        await interaction.reply({
          embeds: [
            new EmbedFactory('🎶 Filter Applied')
              .setDescription(
                filters.is8D
                  ? '8D effect **enabled**'
                  : '8D effect **disabled**'
              )
              .build(),
          ],
        });
        break;

      case 'clear':
        filters.clearFilters();
        await interaction.reply({
          embeds: [
            new EmbedFactory('🎶 Filters Cleared')
              .setDescription('All filters have been reset.')
              .build(),
          ],
        });
        break;

      default:
        await interaction.reply({
          embeds: [
            EmbedFactory.error(
              `Unknown filter: \`${filterType}\`. Use \`/filter\` to see available filters.`
            ),
          ],
        });
        break;
    }
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
}

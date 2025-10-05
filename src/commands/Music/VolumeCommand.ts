import { Command } from '@/core/Command';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { EmbedFactory } from '@/utils/EmbedFactory';

export class VolumeCommand extends Command {
  public name = 'volume';
  public data = new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Set or show the current volume')
    .addIntegerOption((option) =>
      option
        .setName('level')
        .setDescription('Volume level (0-100)')
        .setRequired(false)
        .setMinValue(0)
        .setMaxValue(100)
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
    const volumeLevel = interaction.options.getInteger('level');

    // Show current volume if no arguments
    if (volumeLevel === null) {
      await this.showCurrentVolume(interaction, player);
      return;
    }

    await this.setVolume(interaction, player, volumeLevel);
  }

  private validateCommand(interaction: ChatInputCommandInteraction): {
    error?: string;
    player?: any;
  } {
    if (!interaction.guild) {
      return { error: 'This command can only be used in a server.' };
    }

    const member = interaction.guild.members.cache.get(interaction.user.id);
    const userVoiceChannel = member?.voice?.channel;
    if (!userVoiceChannel) {
      return { error: 'You must be in a voice channel to use this command.' };
    }

    const player = (interaction.client as any).music?.manager?.players?.get(
      interaction.guild.id
    );
    if (!player) {
      return { error: 'No active player in this server.' };
    }

    const botVoiceChannel = interaction.guild.members.me?.voice?.channel;
    if (botVoiceChannel && botVoiceChannel.id !== userVoiceChannel.id) {
      return { error: 'You must be in the same voice channel as the bot.' };
    }

    return { player };
  }

  private async showCurrentVolume(
    interaction: ChatInputCommandInteraction,
    player: any
  ): Promise<void> {
    const currentVolume = player.volume || 100;
    const volumeDisplay = this.createVolumeDisplay(currentVolume);

    const embed = new EmbedFactory('🔊 Current Volume')
      .setDescription(`Current volume:\n${volumeDisplay}`)
      .build();

    await interaction.reply({ embeds: [embed] });
  }

  private parseVolumeInput(input: string): { error?: string; volume?: number } {
    let newVolume: number;

    if (input.endsWith('%')) {
      newVolume = parseInt(input.slice(0, -1));
    } else {
      newVolume = parseInt(input);
    }

    if (isNaN(newVolume)) {
      return { error: 'Please provide a valid volume number (0-100).' };
    }

    // Clamp volume strictly between 0 and 100
    newVolume = Math.max(0, Math.min(100, newVolume));
    return { volume: newVolume };
  }

  private async setVolume(
    interaction: ChatInputCommandInteraction,
    player: any,
    newVolume: number
  ): Promise<void> {
    try {
      await player.setVolume(newVolume);

      const volumeDisplay = this.createVolumeDisplay(newVolume);
      const volumeEmoji = this.getVolumeEmoji(newVolume);

      const embed = new EmbedFactory(`${volumeEmoji} Volume Updated`)
        .setDescription(`Volume set to:\n${volumeDisplay}`)
        .build();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error setting volume:', error);
      await interaction.reply({
        embeds: [EmbedFactory.error('Failed to set volume. Please try again.')],
      });
    }
  }

  private createVolumeDisplay(volume: number): string {
    const volumeRing = this.getVolumeRing(volume);
    const levelDots = this.createLevelDots(volume);
    return `${volumeRing} **${volume}%**\n${levelDots}`;
  }

  private getVolumeRing(volume: number): string {
    const rings = ['◯', '◔', '◑', '◕', '●'];
    const ringIndex = Math.min(Math.floor(volume / 25), 4); // adjust scaling for 0–100
    return rings[ringIndex];
  }

  private createLevelDots(volume: number): string {
    const maxDots = 10;
    const filledDots = Math.min(Math.floor((volume / 100) * maxDots), maxDots);
    let levelDots = '';

    for (let i = 0; i < maxDots; i++) {
      levelDots += this.getDotColor(i, filledDots);
    }

    return levelDots;
  }

  private getDotColor(index: number, filledDots: number): string {
    return index < filledDots ? '🟢' : '⚫';
  }

  private getVolumeEmoji(volume: number): string {
    if (volume === 0) return '🔇';
    if (volume <= 30) return '🔈';
    if (volume <= 70) return '🔉';
    return '🔊';
  }
}

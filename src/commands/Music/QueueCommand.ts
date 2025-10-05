import { Command } from '@/core/Command';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Formatter } from '@/utils/Formatter';
import { EmbedFactory } from '@/utils/EmbedFactory';

interface Track {
  info: {
    title: string;
    uri: string;
    duration?: number;
    artworkUrl?: string;
    thumbnail?: string;
  };
}

export class QueueCommand extends Command {
  public name = 'queue';
  public data = new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Show the current music queue');

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) {
      await interaction.reply({
        embeds: [
          EmbedFactory.error('This command can only be used in a server.'),
        ],
      });
      return;
    }

    const player = (interaction.client as any).music?.manager?.players?.get(
      interaction.guild.id
    );

    if (!player) {
      await interaction.reply({
        embeds: [EmbedFactory.error('No active player in this server.')],
      });
      return;
    }

    const queue = player.queue;
    const current: Track | undefined = queue.current;
    const upcoming: Track[] = queue.buffer || [];

    // Check if queue is completely empty
    if (!current && upcoming.length === 0) {
      await interaction.reply({
        embeds: [EmbedFactory.error('The queue is currently empty.')],
      });
      return;
    }

    let description = '';

    // Now Playing
    if (current) {
      const duration = current.info.duration
        ? Formatter.formatDuration(current.info.duration)
        : 'Unknown';
      description += `🎶 **Now Playing:**\n[${current.info.title}](${current.info.uri}) \`${duration}\`\n\n`;
    }

    // Upcoming tracks
    if (upcoming.length > 0) {
      description += '**Up Next:**\n';

      const displayTracks = upcoming.slice(0, 10);
      displayTracks.forEach((track, i) => {
        const duration = track.info.duration
          ? Formatter.formatDuration(track.info.duration)
          : 'Unknown';
        description += `\`${i + 1}.\` [${track.info.title}](${
          track.info.uri
        }) \`${duration}\`\n`;
      });

      if (upcoming.length > 10) {
        description += `\n...and ${upcoming.length - 10} more track(s)`;
      }
    } else {
      description += '*No upcoming tracks*';
    }

    // Show total queue info
    const totalTracks = (current ? 1 : 0) + upcoming.length;
    const totalDuration = this.calculateTotalDuration(current, upcoming);

    const embed = new EmbedFactory('🎵 Current Queue')
      .setDescription(description)
      .setThumbnail(current?.info.artworkUrl || current?.info.thumbnail || null)
      .setFooter(`${totalTracks} track(s) • Total duration: ${totalDuration}`)
      .build();

    await interaction.reply({ embeds: [embed] });
  }

  private calculateTotalDuration(
    current: Track | undefined,
    upcoming: Track[]
  ): string {
    let totalMs = 0;

    if (current?.info.duration) {
      totalMs += current.info.duration;
    }

    upcoming.forEach((track) => {
      if (track.info.duration) {
        totalMs += track.info.duration;
      }
    });

    if (totalMs === 0) return 'Unknown';

    const totalMinutes = Math.floor(totalMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }
}

import { Command } from '@/core/Command';
import {
  ChatInputCommandInteraction,
  ComponentType,
  ButtonInteraction,
  SlashCommandBuilder,
} from 'discord.js';
import { BotEmbed } from '@/core/Embed';
import { MusicController } from '@/UI/MusicController';

export class PlayerController extends Command {
  public name = 'controller';
  public data = new SlashCommandBuilder()
    .setName('controller')
    .setDescription('Show the music player controller');

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const manager = (interaction.client as any).music.manager;
    const player = manager.players.get(interaction.guild!.id);

    if (!player) {
      await interaction.reply({
        embeds: [BotEmbed.error('No music is currently playing!')],
      });
      return;
    }

    // Create a fake message object for compatibility with MusicController
    const fakeMessage = {
      client: interaction.client,
      guild: interaction.guild,
      channel: interaction.channel,
    } as any;
    const controller = new MusicController(fakeMessage);

    if (!controller.hasPlayer()) {
      await interaction.reply({
        embeds: [BotEmbed.error('No music player found!')],
      });
      return;
    }

    const formatTime = (ms: number) => {
      if (!ms || ms === 0) return '0:00';
      const seconds = Math.floor(ms / 1000);
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const createVolumeDisplay = (vol: number): string => {
      // Helper to get volume ring
      const getVolumeRing = (volume: number): string => {
        if (volume === 0) return '◯';
        if (volume <= 30) return '◔';
        if (volume <= 60) return '◑';
        if (volume <= 90) return '◕';
        return '●';
      };

      // Helper to get the color for a dot
      const getDot = (
        index: number,
        filledDots: number,
        volume: number
      ): string => {
        if (index >= filledDots) return '⚫';
        if (volume <= 100) return index < 6 ? '🟢' : '🟡';
        return index < 6 ? '🟢' : '🔴';
      };

      const volumeRing = getVolumeRing(vol);
      const maxDots = 8;
      const filledDots = Math.min(Math.floor((vol / 150) * maxDots), maxDots);

      let levelDots = '';
      for (let i = 0; i < maxDots; i++) {
        levelDots += getDot(i, filledDots, vol);
      }

      return `${volumeRing} **${vol}%**\n${levelDots}`;
    };

    const buildControllerEmbed = () => {
      const currentTrack = player.queue?.current || player.current;
      const position = player.position || 0;
      const duration = currentTrack?.length || currentTrack?.duration || 0;
      const volume = player.volume || 100;

      // Refactored repeat mode
      let repeatMode: string;
      if (player.repeat === 0) repeatMode = 'Off';
      else if (player.repeat === 1) repeatMode = 'Track';
      else repeatMode = 'Queue';

      const queueSize = player.queue?.size() || player.queue?.length || 0;
      const trackTitle =
        currentTrack?.title || currentTrack?.info?.title || 'Unknown Track';
      const trackAuthor =
        currentTrack?.author || currentTrack?.info?.author || 'Unknown Artist';
      const trackThumbnail =
        currentTrack?.thumbnail || currentTrack?.info?.artworkUrl || null;

      // Refactored status
      let status: string;
      if (player.playing) status = '🟢 Playing';
      else if (player.paused) status = '🟡 Paused';
      else status = '🔴 Stopped';

      const embed = new BotEmbed()
        .setTitle('🎵 Music Controller')
        .setColor('#3498db')
        .addFields([
          {
            name: '🎵 Now Playing',
            value: currentTrack
              ? `**${trackTitle}**\n*by ${trackAuthor}*`
              : 'Nothing playing',
            inline: false,
          },
          {
            name: '⏱️ Progress',
            value: `${formatTime(position)} / ${formatTime(duration)}`,
            inline: true,
          },
          {
            name: '🔊 Volume',
            value: createVolumeDisplay(volume),
            inline: true,
          },
          { name: '🔁 Repeat', value: repeatMode, inline: true },
          { name: '📋 Queue', value: `${queueSize} track(s)`, inline: true },
          { name: '▶️ Status', value: status, inline: true },
        ]);

      if (trackThumbnail) embed.setThumbnail(trackThumbnail);

      return embed;
    };

    await interaction.reply({
      embeds: [buildControllerEmbed()],
      components: controller.getComponents(),
    });

    // Patch init to auto-update embed on any button press
    const originalInit = controller.init.bind(controller);
    const actualMessage = await interaction.fetchReply();
    await originalInit(actualMessage);

    const collector = actualMessage.createMessageComponentCollector({
      componentType: ComponentType.Button, // use enum, not string
      time: 5 * 60 * 1000,
      filter: (buttonInteraction: ButtonInteraction) => {
        return buttonInteraction.user.id === interaction.user.id;
      },
    });

    collector.on('collect', async () => {
      if (!actualMessage) return;
      await interaction.editReply({
        embeds: [buildControllerEmbed()],
        components: controller.getComponents(),
      });
    });
  }
}

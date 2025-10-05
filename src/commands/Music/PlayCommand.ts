import { Command } from '@/core/Command';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { BotEmbed } from '@/core/Embed';
import { MusicController } from '@/UI/MusicController';

export class PlayCommand extends Command {
  public name = 'play';
  public data = new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song or playlist')
    .addStringOption((option) =>
      option
        .setName('query')
        .setDescription('Song name, URL, or search query')
        .setRequired(true)
    );

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const manager = (interaction.client as any).music.manager;
    const member = interaction.guild?.members.cache.get(interaction.user.id);

    if (!member?.voice?.channel) {
      await interaction.reply({
        embeds: [
          BotEmbed.error('You need to be in a voice channel to play music!'),
        ],
      });
      return;
    }

    let player = manager.players.get(interaction.guild!.id);
    if (!player) {
      player = await manager.create({
        voiceChannel: member.voice.channel.id,
        textChannel: interaction.channel!.id,
        guildId: interaction.guild!.id,
        selfDeaf: true,
      });
    }

    const query = interaction.options.getString('query', true);
    if (!query) {
      await interaction.reply({
        embeds: [BotEmbed.error('Provide a song name or URL!')],
      });
      return;
    }

    const res = await manager.search(
      { query, source: 'youtube' },
      interaction.user
    );

    if (!res?.tracks?.length) {
      await interaction.reply({
        embeds: [BotEmbed.error('No results found!')],
      });
      return;
    }

    let track;
    let replyMessage;

    if (res.loadType === 'PLAYLIST_LOADED') {
      player.queue.add(...res.tracks);
      track = res.tracks[0]; // show first track thumbnail as preview

      replyMessage = await interaction.reply({
        embeds: [
          BotEmbed.success(
            `📀 Loaded **${res.tracks.length}** tracks from \`${res.name}\``
          ).setThumbnail(track.info.artworkUrl || track.info.thumbnail || null),
        ],
      });
    } else {
      track = res.tracks[0];
      player.queue.add(track);

      const duration = this.formatDuration(track.info.duration ?? 0);

      // Create music controller instance - we'll create a fake message object for compatibility
      const fakeMessage = {
        client: interaction.client,
        guild: interaction.guild,
        channel: interaction.channel,
      } as any;
      const controller = new MusicController(fakeMessage);

      // Send message with track info and controller components
      replyMessage = await interaction.reply({
        embeds: [
          BotEmbed.success('🎶 Added to Queue')
            .setTitle(track.info.title)
            .setURL(track.info.uri)
            .setThumbnail(track.info.artworkUrl || track.info.thumbnail || null)
            .addFields(
              { name: '⏱ Duration', value: duration, inline: true },
              { name: '🎤 Author', value: track.info.author, inline: true }
            ),
        ],
        components: controller.hasPlayer() ? controller.getComponents() : [],
      });

      // Initialize the controller if player exists
      if (controller.hasPlayer()) {
        const actualMessage = await interaction.fetchReply();
        await controller.init(actualMessage);
      }
    }

    // Start playing if not already playing
    if (!player.playing && !player.paused) {
      player.play();

      // For playlist loading, add controller after playback starts
      if (res.loadType === 'PLAYLIST_LOADED') {
        setTimeout(async () => {
          const fakeMessage = {
            client: interaction.client,
            guild: interaction.guild,
            channel: interaction.channel,
          } as any;
          const controller = new MusicController(fakeMessage);
          if (controller.hasPlayer() && replyMessage) {
            const actualMessage = await interaction.fetchReply();
            await interaction.editReply({
              embeds: actualMessage.embeds,
              components: controller.getComponents(),
            });
            const updatedMessage = await interaction.fetchReply();
            await controller.init(updatedMessage);
          }
        }, 1000);
      }
    }
  }

  private formatDuration(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return hours > 0
      ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds
          .toString()
          .padStart(2, '0')}`
      : `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

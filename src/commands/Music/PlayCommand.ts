import { Command } from "@/core/Command";
import { Message } from "discord.js";
import { BotEmbed } from "@/core/Embed";
import { MusicController } from "@/UI/MusicController";

export class PlayCommand extends Command {
  public name = "play";
  public aliases = ["p"];

  async execute(message: Message, args: string[]): Promise<void> {
    const manager = (message.client as any).music.manager;

    if (!message.member?.voice?.channel) {
      await message.reply({
        embeds: [
          BotEmbed.error("You need to be in a voice channel to play music!"),
        ],
      });
      return;
    }

    let player = manager.players.get(message.guild!.id);
    if (!player) {
      player = await manager.create({
        voiceChannel: message.member.voice.channel.id,
        textChannel: message.channel.id,
        guildId: message.guild!.id,
        selfDeaf: true,
      });
    }

    const query = args.join(" ");
    if (!query) {
      await message.reply({
        embeds: [BotEmbed.error("Provide a song name or URL!")],
      });
      return;
    }

    const res = await manager.search(
      { query, source: "youtube" },
      message.author
    );

    if (!res?.tracks?.length) {
      await message.reply({ embeds: [BotEmbed.error("No results found!")] });
      return;
    }

    let track;
    let replyMessage;

    if (res.loadType === "PLAYLIST_LOADED") {
      player.queue.add(...res.tracks);
      track = res.tracks[0]; // show first track thumbnail as preview

      replyMessage = await message.reply({
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

      // Create music controller instance
      const controller = new MusicController(message);

      // Send message with track info and controller components
      replyMessage = await message.reply({
        embeds: [
          BotEmbed.success("🎶 Added to Queue")
            .setTitle(track.info.title)
            .setURL(track.info.uri)
            .setThumbnail(track.info.artworkUrl || track.info.thumbnail || null)
            .addFields(
              { name: "⏱ Duration", value: duration, inline: true },
              { name: "🎤 Author", value: track.info.author, inline: true }
            ),
        ],
        components: controller.hasPlayer() ? controller.getComponents() : [],
      });

      // Initialize the controller if player exists
      if (controller.hasPlayer()) {
        await controller.init(replyMessage);
      }
    }

    // Start playing if not already playing
    if (!player.playing && !player.paused) {
      player.play();

      // For playlist loading, add controller after playback starts
      if (res.loadType === "PLAYLIST_LOADED") {
        setTimeout(async () => {
          const controller = new MusicController(message);
          if (controller.hasPlayer() && replyMessage) {
            await replyMessage.edit({
              embeds: replyMessage.embeds,
              components: controller.getComponents(),
            });
            await controller.init(replyMessage);
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
      ? `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`
      : `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
}

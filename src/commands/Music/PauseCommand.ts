import { Command } from "@/core/Command";
import { Message } from "discord.js";

export class PauseCommand extends Command {
  public name = "pause";
  public aliases = ["resume"];

  async execute(message: Message): Promise<void> {
    const player = (message.client as any).music.manager.players.get(
      message.guild!.id
    );

    if (!player) {
      await message.reply("❌ No active player.");
      return;
    }
    if (player.paused) {
      player.pause(false); // This resumes playback
      await message.reply("▶️ Resumed!");
    } else {
      player.pause(true); // This pauses playback
      await message.reply("⏸️ Paused!");
    }
  }
}

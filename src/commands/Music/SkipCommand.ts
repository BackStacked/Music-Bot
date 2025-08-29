import { Command } from "@/core/Command";
import { Message } from "discord.js";

export class SkipCommand extends Command {
  public name = "skip";
  public aliases = ["s"];

  async execute(message: Message): Promise<void> {
    const player = (message.client as any).music.manager.players.get(
      message.guild!.id
    );

    if (!player) {
      await message.reply("❌ No active player.");
      return;
    }

    if (!player.queue.current) {
      await message.reply("❌ Nothing is currently playing.");
      return;
    }

    player.stop();
    await message.reply("⏭️ Skipped!");
  }
}

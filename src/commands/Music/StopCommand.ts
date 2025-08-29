import { Command } from "@/core/Command";
import { Message } from "discord.js";

export class StopCommand extends Command {
  public name = "stop";
  public aliases = ["disconnect"];

  async execute(message: Message): Promise<void> {
    const player = (message.client as any).music.manager.players.get(
      message.guild!.id
    );

    if (!player) {
      await message.reply("❌ No active player.");
      return;
    }

    player.destroy();
    await message.reply("🛑 Stopped and disconnected.");
  }
}

import { Command } from "@/core/Command";
import { Message } from "discord.js";
import { BotEmbed } from "@/core/Embed";

export class HelpCommand extends Command {
  public name = "help";

  async execute(message: Message): Promise<void> {
    const commands = [
      "`!play <song>` - Play a song",
      "`!skip` - Skip current song",
      "`!stop` - Stop and disconnect",
      "`!queue` - Show queue",
      "`!pause` - Pause/Resume playback",
      "`!help` - Show this message",
    ];

    const embed = new BotEmbed("📖 Help Menu", commands.join("\n"));
    await message.reply({ embeds: [embed] });
  }
}

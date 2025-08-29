import { Command } from "@/core/Command";
import { Message } from "discord.js";
import { EmbedFactory } from "@/utils/EmbedFactory";

type LoopMode = "OFF" | "TRACK" | "QUEUE";

export class LoopCommand extends Command {
  public name = "loop";
  public aliases = ["repeat"];

  async execute(message: Message, args: string[]): Promise<void> {
    const validationResult = this.validateCommand(message);
    if (validationResult.error) {
      await message.reply({
        embeds: [EmbedFactory.error(validationResult.error)],
      });
      return;
    }

    const player = validationResult.player!;
    const currentMode = this.getLoopMode(player);

    let nextMode: LoopMode;

    if (args.length > 0) {
      // If user provided argument, set directly
      const input = args[0].toLowerCase();
      if (input === "off") nextMode = "OFF";
      else if (input === "track") nextMode = "TRACK";
      else if (input === "queue") nextMode = "QUEUE";
      else {
        await message.reply({
          embeds: [
            EmbedFactory.error(
              "Invalid loop option. Use `off`, `track`, or `queue`."
            ),
          ],
        });
        return;
      }
    } else {
      // No args -> cycle automatically
      nextMode = this.getNextMode(currentMode);
    }

    // map to Lavalink/erela type values
    const loopMap: Record<LoopMode, string> = {
      OFF: "none",
      TRACK: "track",
      QUEUE: "queue",
    };
    player.setLoop(loopMap[nextMode]);

    await message.reply({
      embeds: [
        new EmbedFactory("🔁 Loop Mode Updated")
          .setDescription(
            `Loop mode changed from **${currentMode}** ➝ **${nextMode}**`
          )
          .build(),
      ],
    });
  }

  private validateCommand(message: Message): { error?: string; player?: any } {
    if (!message.guild) {
      return { error: "This command can only be used in a server." };
    }

    const player = (message.client as any).music?.manager?.players?.get(
      message.guild.id
    );
    if (!player) {
      return { error: "No active player in this server." };
    }

    return { player };
  }

  private getLoopMode(player: any): LoopMode {
    const repeat = player.loop;
    if (repeat === "track") return "TRACK";
    if (repeat === "queue") return "QUEUE";
    return "OFF";
  }

  private getNextMode(current: LoopMode): LoopMode {
    switch (current) {
      case "OFF":
        return "TRACK";
      case "TRACK":
        return "QUEUE";
      case "QUEUE":
      default:
        return "OFF";
    }
  }
}

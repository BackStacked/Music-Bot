import { Command } from "@/core/Command";
import { Message } from "discord.js";
import { EmbedFactory } from "@/utils/EmbedFactory";

export class FilterCommand extends Command {
  public name = "filter";
  public aliases = ["fx", "effects"];

  async execute(message: Message, args: string[]): Promise<void> {
    const validationResult = this.validateCommand(message);
    if (validationResult.error) {
      await message.reply({
        embeds: [EmbedFactory.error(validationResult.error)],
      });
      return;
    }

    const player = validationResult.player!;
    const filters = player.filter; // using FilterManager

    if (args.length === 0) {
      await message.reply({
        embeds: [
          new EmbedFactory("🎛️ Available Filters")
            .setDescription(
              [
                "`bassboost <level>` - boost bass (0–5)",
                "`nightcore` - enable/disable nightcore",
                "`vaporwave` - enable/disable vaporwave",
                "`8d` - enable/disable 8D rotation",
                "`clear` - reset all filters",
              ].join("\n")
            )
            .build(),
        ],
      });
      return;
    }

    const subcommand = args[0].toLowerCase();
    switch (subcommand) {
      case "bassboost": {
        const level = parseInt(args[1] || "2");
        if (isNaN(level) || level < 0 || level > 5) {
          await message.reply({
            embeds: [
              EmbedFactory.error("Bassboost level must be between 0 and 5."),
            ],
          });
          return;
        }

        const bands = Array(15)
          .fill(0)
          .map((_, i) => ({
            band: i,
            gain: i < 3 ? level * 0.2 : 0, // boost lower frequencies
          }));
        filters.setEqualizer(bands);

        await message.reply({
          embeds: [
            new EmbedFactory("🎶 Filter Applied")
              .setDescription(`Bassboost set to **${level}**`)
              .build(),
          ],
        });
        break;
      }

      case "nightcore":
        filters.setNightcore(!filters.nightcore);
        await message.reply({
          embeds: [
            new EmbedFactory("🎶 Filter Applied")
              .setDescription(
                filters.nightcore
                  ? "Nightcore **enabled** (rate 1.5)"
                  : "Nightcore **disabled**"
              )
              .build(),
          ],
        });
        break;

      case "vaporwave":
        filters.setTimescale(
          filters.vaporwave ? null : { pitch: 0.9, rate: 1.0, speed: 0.8 }
        );
        filters.vaporwave = !filters.vaporwave;
        await message.reply({
          embeds: [
            new EmbedFactory("🎶 Filter Applied")
              .setDescription(
                filters.vaporwave
                  ? "Vaporwave **enabled**"
                  : "Vaporwave **disabled**"
              )
              .build(),
          ],
        });
        break;

      case "8d":
        filters.set8D(!filters.is8D);
        await message.reply({
          embeds: [
            new EmbedFactory("🎶 Filter Applied")
              .setDescription(
                filters.is8D
                  ? "8D effect **enabled**"
                  : "8D effect **disabled**"
              )
              .build(),
          ],
        });
        break;

      case "clear":
        filters.clearFilters();
        await message.reply({
          embeds: [
            new EmbedFactory("🎶 Filters Cleared")
              .setDescription("All filters have been reset.")
              .build(),
          ],
        });
        break;

      default:
        await message.reply({
          embeds: [
            EmbedFactory.error(
              `Unknown filter: \`${subcommand}\`. Run \`!filter\` for a list of filters.`
            ),
          ],
        });
        break;
    }
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
}

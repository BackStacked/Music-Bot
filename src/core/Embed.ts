import { EmbedBuilder, ColorResolvable } from "discord.js";

export class BotEmbed extends EmbedBuilder {
  constructor(
    title?: string,
    description?: string,
    color: ColorResolvable = "Blue"
  ) {
    super();
    if (title) this.setTitle(title);
    if (description) this.setDescription(description);
    this.setColor(color);
    this.setTimestamp();
    this.setFooter({ text: "🎵 Music Bot" });
  }

  static success(description: string) {
    return new BotEmbed("✅ Success", description, "Green");
  }

  static error(description: string) {
    return new BotEmbed("❌ Error", description, "Red");
  }

  static info(description: string) {
    return new BotEmbed("ℹ️ Info", description, "Blue");
  }
}

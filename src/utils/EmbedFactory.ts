import { EmbedBuilder, ColorResolvable } from "discord.js";

export class EmbedFactory {
  private readonly embed: EmbedBuilder;

  constructor(title?: string, color: ColorResolvable = 0x1db954) {
    this.embed = new EmbedBuilder().setColor(color);
    if (title) this.embed.setTitle(title);
  }

  public setDescription(desc: string): this {
    this.embed.setDescription(desc);
    return this;
  }

  public setThumbnail(url: string | null | undefined): this {
    if (url) this.embed.setThumbnail(url);
    return this;
  }

  public addField(name: string, value: string, inline = false): this {
    this.embed.addFields({ name, value, inline });
    return this;
  }

  public setFooter(text: string): this {
    this.embed.setFooter({ text });
    return this;
  }

  public build(): EmbedBuilder {
    return this.embed;
  }

  // Static helpers
  public static success(message: string): EmbedBuilder {
    return new EmbedFactory("✅ Success", 0x57f287)
      .setDescription(message)
      .build();
  }

  public static error(message: string): EmbedBuilder {
    return new EmbedFactory("❌ Error", 0xed4245)
      .setDescription(message)
      .build();
  }
}

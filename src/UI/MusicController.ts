import {
  Message,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  ButtonInteraction,
  CacheType,
  MessageFlags,
} from "discord.js";

export class MusicController {
  private readonly message: Message;
  private readonly player: any;
  private readonly manager: any;
  private loopMode: "OFF" | "TRACK" | "QUEUE";
  private controllerMessage: Message | null = null;

  constructor(message: Message) {
    this.message = message;
    this.manager = (message.client as any).music.manager;
    this.player = this.manager.players.get(message.guild!.id);

    // Initial loop mode (no nested ternary)
    const repeat = this.player?.loop;
    if (repeat === "track") {
      this.loopMode = "TRACK";
    } else if (repeat === "queue") {
      this.loopMode = "QUEUE";
    } else {
      this.loopMode = "OFF";
    }
  }

  // Helper to build first row of controller buttons
  private buildRow(): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("play_pause")
        .setLabel(this.player?.playing ? "⏸ Pause" : "▶ Play")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("skip")
        .setLabel("⏭ Skip")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("stop")
        .setLabel("⏹ Stop")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("loop")
        .setLabel(`🔁 Loop: ${this.loopMode}`)
        .setStyle(ButtonStyle.Secondary)
    );
  }

  // Helper to build second row of controller buttons
  private buildSecondRow(): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("vol_down")
        .setLabel("🔉 -10")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("vol_up")
        .setLabel("🔊 +10")
        .setStyle(ButtonStyle.Secondary)
    );
  }

  // Adjust volume helper
  private async adjustVolume(
    change: number,
    interaction: ButtonInteraction
  ): Promise<void> {
    const newVolume = Math.max(
      0,
      Math.min(100, (this.player.volume || 100) + change)
    );
    await this.player.setVolume(newVolume);

    if (this.controllerMessage) {
      await this.controllerMessage.edit({
        components: [this.buildRow(), this.buildSecondRow()],
      });
    }

    await interaction.reply({
      content: `🔊 Volume set to **${newVolume}%**`,
      flags: MessageFlags.Ephemeral,
    });
  }

  // Action Handlers
  private async handlePlayPause(
    interaction: ButtonInteraction,
    controllerMessage: Message
  ) {
    if (this.player.playing) {
      this.player.pause(true);
    } else {
      this.player.pause(false);
    }

    await controllerMessage.edit({
      components: [this.buildRow(), this.buildSecondRow()],
    });

    await interaction.reply({
      content: this.player.playing ? "⏸ Paused playback" : "▶ Resumed playback",
      flags: MessageFlags.Ephemeral,
    });
  }

  private async handleSkip(interaction: ButtonInteraction) {
    this.player.stop();
    await interaction.reply({
      content: "⏭ Skipped current track",
      flags: MessageFlags.Ephemeral,
    });
  }

  private async handleStop(interaction: ButtonInteraction) {
    this.player.stop();
    await interaction.reply({
      content: "⏹ Stopped playback",
      flags: MessageFlags.Ephemeral,
    });
  }

  private async handleLoop(
    interaction: ButtonInteraction,
    controllerMessage: Message
  ) {
    const currentLoop = this.player.loop as "none" | "track" | "queue";

    let newLoop: "none" | "track" | "queue";
    if (currentLoop === "none") {
      newLoop = "track";
    } else if (currentLoop === "track") {
      newLoop = "queue";
    } else {
      newLoop = "none";
    }

    this.player.setLoop(newLoop);

    if (newLoop === "none") {
      this.loopMode = "OFF";
    } else if (newLoop === "track") {
      this.loopMode = "TRACK";
    } else {
      this.loopMode = "QUEUE";
    }

    await controllerMessage.edit({
      components: [this.buildRow(), this.buildSecondRow()],
    });

    await interaction.reply({
      content: `🔁 Loop mode set to **${this.loopMode}**`,
      flags: MessageFlags.Ephemeral,
    });
  }

  // Add controller to existing message reply options
  public getComponents(): ActionRowBuilder<ButtonBuilder>[] {
    if (!this.player) return [];
    return [this.buildRow(), this.buildSecondRow()];
  }

  // Initialize controller with message
  public async init(controllerMessage: Message): Promise<void> {
    if (!this.player) return;

    this.controllerMessage = controllerMessage;

    const collector = controllerMessage.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 5 * 60 * 1000, // 5 minutes
    });

    collector.on(
      "collect",
      async (interaction: ButtonInteraction<CacheType>) => {
        if (
          !interaction.isButton() ||
          interaction.user.id !== this.message.author.id
        ) {
          await interaction.reply({
            content: "❌ You cannot use this controller!",
            flags: MessageFlags.Ephemeral,
          });
          return;
        }

        if (!this.manager.players.get(this.message.guild!.id)) {
          await interaction.reply({
            content: "❌ Player no longer exists!",
            flags: MessageFlags.Ephemeral,
          });
          collector.stop();
          return;
        }

        switch (interaction.customId) {
          case "play_pause":
            await this.handlePlayPause(interaction, controllerMessage);
            break;
          case "skip":
            await this.handleSkip(interaction);
            break;
          case "stop":
            await this.handleStop(interaction);
            break;
          case "loop":
            await this.handleLoop(interaction, controllerMessage);
            break;
          case "vol_down":
            await this.adjustVolume(-10, interaction);
            break;
          case "vol_up":
            await this.adjustVolume(10, interaction);
            break;
        }
      }
    );

    collector.on("end", async () => {
      try {
        await controllerMessage.edit({ components: [] });
      } catch (error) {
        console.log("Could not disable controller buttons:", error);
      }
    });
  }

  // Check if player exists
  public hasPlayer(): boolean {
    return !!this.player;
  }
}

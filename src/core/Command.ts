import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
} from 'discord.js';

export abstract class Command {
  public abstract name: string;
  public abstract data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
  public abstract execute(
    interaction: ChatInputCommandInteraction
  ): Promise<void>;
}

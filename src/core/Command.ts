import { Message } from "discord.js";

export abstract class Command {
  public abstract name: string;
  public aliases: string[] = [];
  public abstract execute(message: Message, args: string[]): Promise<void>;
}

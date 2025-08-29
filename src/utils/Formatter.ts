export class Formatter {
  // Convert milliseconds to mm:ss format
  public static formatDuration(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  // Optional: truncate long strings
  public static truncate(text: string, length: number, suffix = "..."): string {
    return text.length > length ? text.slice(0, length) + suffix : text;
  }
}

export function parseTimespanToMilliSeconds(timespan: string): number {
  const match = /^(\d+)([smhd])$/.exec(timespan);
  if (!match) throw new Error("Invalid timespan format");
  const [_, num, unit] = match;
  const n = parseInt(num, 10);
  switch (unit) {
    case "s":
      return n * 1000;
    case "m":
      return n * 60 * 1000;
    case "h":
      return n * 60 * 60 * 1000;
    case "d":
      return n * 24 * 60 * 60 * 1000;
    default:
      throw new Error("Invalid timespan unit");
  }
}

export function parseTimespanToSeconds(ts: string): number {
  // e.g. "15m", "1h", "7d", "30s"
  const match = /^(\d+)([smhd])$/.exec(ts);
  if (!match) throw new Error(`Invalid timespan format: ${ts}`);
  const [, numStr, unit] = match;
  const num = Number(numStr);
  switch (unit) {
    case "s":
      return num;
    case "m":
      return num * 60;
    case "h":
      return num * 60 * 60;
    case "d":
      return num * 24 * 60 * 60;
    default:
      throw new Error(`Invalid timespan unit in ${ts}`);
  }
}

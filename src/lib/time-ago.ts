export function timeAgo(isoDate: string) {
  const date = new Date(isoDate);
  const diffMs = date.getTime() - Date.now();
  const diffSec = Math.round(diffMs / 1000);

  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

  const divisions: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["week", 60 * 60 * 24 * 7],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
    ["second", 1],
  ];

  for (const [unit, secondsInUnit] of divisions) {
    if (Math.abs(diffSec) >= secondsInUnit || unit === "second") {
      const value = Math.round(diffSec / secondsInUnit);
      return rtf.format(value, unit);
    }
  }
}
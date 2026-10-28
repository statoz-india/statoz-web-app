const istDay = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" });

/**
 * A match day as the day endpoints expect it: YYYY-MM-DD in India time. That
 * is not the UTC date between midnight and 05:30 IST, nor the device's date.
 */
export function toISTDate(date: Date): string {
  return istDay.format(date);
}

export function todayInIST(): string {
  return toISTDate(new Date());
}

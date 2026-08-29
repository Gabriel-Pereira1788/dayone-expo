import { formatLedgerHeaderLabel, formatShortDate, formatTimeOfDay, getIsoWeekNumber } from "../date-format";

describe("getIsoWeekNumber", () => {
  // ISO-8601 weeks start on Monday; week 1 is the week containing the year's first Thursday.
  it("returns week 1 for a date in the first ISO week of the year", () => {
    expect(getIsoWeekNumber(new Date(2024, 0, 4))).toBe(1);
  });

  it("returns the correct mid-year week number", () => {
    expect(getIsoWeekNumber(new Date(2024, 7, 27))).toBe(35);
  });

  it("attributes early-January dates to the prior year's last week when appropriate", () => {
    // 2023-01-01 is a Sunday, so it belongs to ISO week 52 of 2022.
    expect(getIsoWeekNumber(new Date(2023, 0, 1))).toBe(52);
  });
});

describe("formatLedgerHeaderLabel", () => {
  // "THU 27 AUG · WEEK 35" — the ledger header caption (design/ 1a).
  it("formats weekday, day, month, and ISO week", () => {
    // 2024-08-27 is a Tuesday.
    expect(formatLedgerHeaderLabel(new Date(2024, 7, 27))).toBe("TUE 27 AUG · WEEK 35");
  });
});

describe("formatTimeOfDay", () => {
  // "HH:MM" from an ISO timestamp, for a habit's completion time in a ledger row.
  it("pads single-digit hours and minutes", () => {
    expect(formatTimeOfDay("2024-08-27T09:05:00")).toBe("09:05");
  });

  it("formats double-digit hours and minutes as-is", () => {
    expect(formatTimeOfDay("2024-08-27T21:45:00")).toBe("21:45");
  });
});

describe("formatShortDate", () => {
  // "27 AUG" — used for the ledger footer's "last break" date and the closed-day header.
  it("formats a YYYY-MM-DD date key as day + month", () => {
    expect(formatShortDate("2024-08-27")).toBe("27 AUG");
  });
});

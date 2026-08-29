import { describeClosedDay, describeHabitContinuity, numberToWord } from "../phrasing";

describe("numberToWord", () => {
  it("spells out numbers within the known small-number range", () => {
    expect(numberToWord(0)).toBe("Zero");
    expect(numberToWord(7)).toBe("Seven");
    expect(numberToWord(12)).toBe("Twelve");
  });

  it("falls back to the numeric string outside the known range", () => {
    expect(numberToWord(13)).toBe("13");
  });
});

describe("describeClosedDay", () => {
  it("spells out the completed-habit count as a closing headline", () => {
    expect(describeClosedDay(3)).toBe("Three for three.");
  });

  it("falls back to a numeric headline once past the known small-number words", () => {
    expect(describeClosedDay(20)).toBe("20 for 20.");
  });
});

describe("describeHabitContinuity", () => {
  // The mono caption under a habit's dash run in the focus flow (design/ 1d,
  // 3a): "SIX DAYS · ONE MISSED" while open, "SEVEN DAYS UNBROKEN" the
  // moment it's completed with a clean recent run.
  it("reports an unbroken streak, counting the just-completed day", () => {
    expect(describeHabitContinuity(0, 6, true)).toBe("Seven DAYS UNBROKEN");
  });

  it("reports an unbroken streak without inflating the count when not just completed", () => {
    expect(describeHabitContinuity(0, 6, false)).toBe("Six DAYS UNBROKEN");
  });

  it("reports the miss count instead once the window has a gap", () => {
    expect(describeHabitContinuity(1, 6, true)).toBe("Six DAYS · One MISSED");
  });
});

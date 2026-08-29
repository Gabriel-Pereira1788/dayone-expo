import type { Habit } from "@/modules/habit/domain/types";
import type { Streak } from "@/modules/streak/domain/types";
import { computeHabitDashMarks, countMissed } from "../habit-continuity";

function makeHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: "habit-1",
    userId: "user-1",
    title: "Read",
    description: null,
    icon: null,
    frequency: "daily",
    dayOfWeek: null,
    dayOfMonth: null,
    hours: null,
    minutes: null,
    startDate: "2024-01-01",
    endDate: null,
    targetDurationInDays: null,
    completed: false,
    updatedAt: Date.now(),
    ...overrides,
  };
}

function makeStreak(createdAt: string): Streak {
  return {
    id: `streak-${createdAt}`,
    userId: "user-1",
    habitId: "habit-1",
    createdAt,
    updatedAt: Date.now(),
  };
}

describe("computeHabitDashMarks", () => {
  // The habit's own last 6 due occurrences before today (design/ 1d's six
  // dashes), regardless of frequency — a weekly habit looks back across
  // weeks, not calendar days.
  const today = new Date("2024-06-10T12:00:00.000Z");

  it("marks a due day with a check-in as done", () => {
    const habit = makeHabit();
    const streaks = [makeStreak("2024-06-09T08:00:00.000Z")];
    const marks = computeHabitDashMarks(habit, streaks, today);
    expect(marks[marks.length - 1]).toBe("done");
  });

  it("marks a due day without a check-in as a gap", () => {
    const habit = makeHabit();
    const marks = computeHabitDashMarks(habit, [], today);
    expect(marks[marks.length - 1]).toBe("gap");
  });

  it("returns at most the six most recent due occurrences, oldest first", () => {
    const habit = makeHabit();
    const marks = computeHabitDashMarks(habit, [], today);
    expect(marks).toHaveLength(6);
  });

  it("only looks back across the habit's own due days for a weekly habit", () => {
    // 2024-06-10 is a Monday; a weekly Monday habit's marks span six weeks, not six days.
    const habit = makeHabit({ frequency: "weekly", dayOfWeek: 1 });
    const streaks = [makeStreak("2024-06-03T08:00:00.000Z")];
    const marks = computeHabitDashMarks(habit, streaks, today);
    expect(marks[marks.length - 1]).toBe("done");
  });

  describe("with a UTC offset west of GMT (e.g. UTC-3)", () => {
    const originalTz = process.env.TZ;

    beforeAll(() => {
      process.env.TZ = "America/Sao_Paulo";
    });

    afterAll(() => {
      process.env.TZ = originalTz;
    });

    // Regression: same UTC-vs-local day-boundary issue as streak-stats — a
    // check-in's UTC `createdAt` date can roll over to tomorrow while the
    // local wall clock is still today.
    it("marks a due day as done when its check-in's UTC date already rolled over locally", () => {
      const habit = makeHabit();
      // 2024-06-09 23:00 local (UTC-3) is already 2024-06-10 in UTC.
      const streaks = [makeStreak("2024-06-10T02:00:00.000Z")];
      const today = new Date(2024, 5, 10, 8, 0, 0); // 2024-06-10 08:00 local
      const marks = computeHabitDashMarks(habit, streaks, today);
      expect(marks[marks.length - 1]).toBe("done");
    });
  });
});

describe("countMissed", () => {
  it("counts only the gap marks", () => {
    expect(countMissed(["done", "gap", "done", "gap", "gap"])).toBe(3);
  });

  it("returns zero for an all-done run", () => {
    expect(countMissed(["done", "done"])).toBe(0);
  });
});

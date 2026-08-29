import type { Habit } from "@/modules/habit/domain/types";
import type { Streak } from "@/modules/streak/domain/types";
import { buildContinuitySegments, computeDayStreakStats } from "../streak-stats";

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

function makeStreak(overrides: Partial<Streak> = {}): Streak {
  return {
    id: "streak-1",
    userId: "user-1",
    habitId: "habit-1",
    createdAt: "2024-06-10T08:00:00.000Z",
    updatedAt: Date.now(),
    ...overrides,
  };
}

describe("computeDayStreakStats", () => {
  const today = new Date("2024-06-10T12:00:00.000Z");

  it("shows zero stats and no daily flags when there are no active habits", () => {
    const stats = computeDayStreakStats([], [], { today, lookbackDays: 3 });
    expect(stats.dailyFlags).toEqual([]);
    expect(stats.current).toBe(0);
    expect(stats.best).toBe(0);
    expect(stats.lastBreakDateKey).toBeNull();
  });

  // Today stays "in progress" rather than counted as a break while it's still open.
  it("does not treat an incomplete today as a break", () => {
    const habit = makeHabit();
    const stats = computeDayStreakStats([habit], [], { today, lookbackDays: 1 });
    expect(stats.current).toBe(0);
    expect(stats.lastBreakDateKey).toBeNull();
  });

  it("counts consecutive complete days ending today as the current streak", () => {
    const habit = makeHabit();
    const streaks = [
      makeStreak({ id: "s1", createdAt: "2024-06-08T08:00:00.000Z" }),
      makeStreak({ id: "s2", createdAt: "2024-06-09T08:00:00.000Z" }),
      makeStreak({ id: "s3", createdAt: "2024-06-10T08:00:00.000Z" }),
    ];
    const stats = computeDayStreakStats([habit], streaks, { today, lookbackDays: 5 });
    expect(stats.current).toBe(3);
  });

  it("stops the current streak at the most recent unchecked due day", () => {
    const habit = makeHabit();
    const streaks = [makeStreak({ id: "s1", createdAt: "2024-06-10T08:00:00.000Z" })];
    // 2024-06-09 has no check-in, breaking the chain before today.
    const stats = computeDayStreakStats([habit], streaks, { today, lookbackDays: 5 });
    expect(stats.current).toBe(1);
    expect(stats.lastBreakDateKey).toBe("2024-06-09");
  });

  it("finds the best historical run, excluding an incomplete today", () => {
    const habit = makeHabit();
    const streaks = [
      makeStreak({ id: "s1", createdAt: "2024-06-05T08:00:00.000Z" }),
      makeStreak({ id: "s2", createdAt: "2024-06-06T08:00:00.000Z" }),
      makeStreak({ id: "s3", createdAt: "2024-06-07T08:00:00.000Z" }),
    ];
    const stats = computeDayStreakStats([habit], streaks, { today, lookbackDays: 10 });
    expect(stats.best).toBe(3);
  });

  it("shows no streak when every habit is completed (no active habits)", () => {
    const habit = makeHabit({ completed: true });
    const stats = computeDayStreakStats([habit], [], { today, lookbackDays: 1 });
    expect(stats.current).toBe(0);
    expect(stats.best).toBe(0);
  });

  // Regression: a habit created today has no due days before its own
  // startDate — those days must not be manufactured as a "complete" streak
  // just because a 400-day lookback window looks further back than the
  // habit's own history.
  it("does not count days before the habit's start date as a streak, even over a long lookback", () => {
    const habit = makeHabit({ startDate: "2024-06-10" });
    const stats = computeDayStreakStats([habit], [], { today, lookbackDays: 400 });
    expect(stats.current).toBe(0);
    expect(stats.best).toBe(0);
    expect(stats.dailyFlags).toHaveLength(1);
    expect(stats.dailyFlags[0].dateKey).toBe("2024-06-10");
  });

  it("caps the best streak at the number of days actually tracked since the habit started", () => {
    const habit = makeHabit({ startDate: "2024-06-08" });
    const streaks = [
      makeStreak({ id: "s1", createdAt: "2024-06-08T08:00:00.000Z" }),
      makeStreak({ id: "s2", createdAt: "2024-06-09T08:00:00.000Z" }),
      makeStreak({ id: "s3", createdAt: "2024-06-10T08:00:00.000Z" }),
    ];
    const stats = computeDayStreakStats([habit], streaks, { today, lookbackDays: 400 });
    expect(stats.current).toBe(3);
    expect(stats.best).toBe(3);
  });

  describe("with a UTC offset west of GMT (e.g. UTC-3)", () => {
    const originalTz = process.env.TZ;

    beforeAll(() => {
      process.env.TZ = "America/Sao_Paulo";
    });

    afterAll(() => {
      process.env.TZ = originalTz;
    });

    // Regression: a check-in made late in the evening local time can have a
    // `createdAt` UTC string whose calendar date has already rolled over to
    // tomorrow, even though the local wall clock is still today. Comparing
    // against the UTC-sliced date string instead of the local date would
    // silently never match "today" for the rest of that evening.
    it("still counts a late-evening check-in as today, even though its UTC date already rolled over", () => {
      const lateEveningLocal = new Date(2024, 5, 10, 22, 0, 0); // 2024-06-10 22:00 local
      const habit = makeHabit();
      const streaks = [makeStreak({ createdAt: "2024-06-11T01:05:00.000Z" })]; // same instant, next UTC day
      const stats = computeDayStreakStats([habit], streaks, { today: lateEveningLocal, lookbackDays: 1 });
      expect(stats.current).toBe(1);
    });
  });
});

describe("buildContinuitySegments", () => {
  // Collapses chronological day flags into contiguous active/gap runs for `ContinuityTrack`.
  it("collapses consecutive same-state flags into a single segment", () => {
    const segments = buildContinuitySegments([
      { dateKey: "2024-06-08", complete: true },
      { dateKey: "2024-06-09", complete: true },
      { dateKey: "2024-06-10", complete: false },
    ]);
    expect(segments).toEqual([
      { length: 2, active: true },
      { length: 1, active: false },
    ]);
  });

  it("returns an empty list for an empty input", () => {
    expect(buildContinuitySegments([])).toEqual([]);
  });
});

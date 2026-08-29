import type { Habit } from "@/modules/habit/domain/types";
import { isHabitDueOn } from "../frequency";

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

describe("isHabitDueOn", () => {
  it("is due every day for a daily habit", () => {
    const habit = makeHabit({ frequency: "daily" });
    expect(isHabitDueOn(habit, new Date(2024, 5, 10))).toBe(true);
    expect(isHabitDueOn(habit, new Date(2024, 5, 11))).toBe(true);
  });

  it("is due only on its scheduled weekday for a weekly habit", () => {
    // 2024-06-10 is a Monday (day 1).
    const habit = makeHabit({ frequency: "weekly", dayOfWeek: 1 });
    expect(isHabitDueOn(habit, new Date(2024, 5, 10))).toBe(true);
    expect(isHabitDueOn(habit, new Date(2024, 5, 11))).toBe(false);
  });

  it("is due only on its scheduled day of month for a monthly habit", () => {
    const habit = makeHabit({ frequency: "monthly", dayOfMonth: 15 });
    expect(isHabitDueOn(habit, new Date(2024, 5, 15))).toBe(true);
    expect(isHabitDueOn(habit, new Date(2024, 5, 16))).toBe(false);
  });

  it("is never due before its start date, even on an otherwise matching day", () => {
    const habit = makeHabit({ frequency: "daily", startDate: "2024-06-10" });
    expect(isHabitDueOn(habit, new Date(2024, 5, 9))).toBe(false);
    expect(isHabitDueOn(habit, new Date(2024, 5, 10))).toBe(true);
  });

  it("is never due after its end date", () => {
    const habit = makeHabit({ frequency: "daily", startDate: "2024-01-01", endDate: "2024-06-10" });
    expect(isHabitDueOn(habit, new Date(2024, 5, 10))).toBe(true);
    expect(isHabitDueOn(habit, new Date(2024, 5, 11))).toBe(false);
  });
});

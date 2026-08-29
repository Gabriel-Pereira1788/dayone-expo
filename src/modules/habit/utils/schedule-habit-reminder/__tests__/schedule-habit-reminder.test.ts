import type { ScheduleNotificationImpl } from "@/infra/adapters/schedule-notification/types";
import { toHabitReminderPlan, scheduleHabitReminder, type HabitReminderSource } from "../schedule-habit-reminder";
import { HABIT_REMINDER_MESSAGE } from "../schedule-habit-reminder.constants";

function makeHabit(overrides: Partial<HabitReminderSource> = {}): HabitReminderSource {
  return {
    id: "habit-1",
    title: "Read",
    frequency: "daily",
    hours: 9,
    minutes: 30,
    dayOfWeek: null,
    dayOfMonth: null,
    completed: false,
    ...overrides,
  };
}

function makeScheduleNotificationSpy(): ScheduleNotificationImpl & { calls: unknown[][] } {
  const calls: unknown[][] = [];
  return {
    calls,
    schedule: (...args) => calls.push(["schedule", ...args]),
    cancel: (...args) => calls.push(["cancel", ...args]),
    addListener: () => () => {},
  };
}

describe("toHabitReminderPlan", () => {
  it("plans a daily reminder at the habit's hour and minute", () => {
    const habit = makeHabit({ frequency: "daily", hours: 9, minutes: 30 });
    expect(toHabitReminderPlan(habit)).toEqual({
      frequency: "daily",
      notification: { id: "habit-1", title: "Read", message: HABIT_REMINDER_MESSAGE },
      date: { hour: 9, minute: 30 },
    });
  });

  it("converts JS Sunday=0 weekday convention to the library's Sunday=1 convention", () => {
    const habit = makeHabit({ frequency: "weekly", dayOfWeek: 0 });
    expect(toHabitReminderPlan(habit)?.date).toEqual({ hour: 9, minute: 30, dayOfWeek: 1 });
  });

  it("converts JS Monday=1 weekday convention to the library's Monday=2 convention", () => {
    const habit = makeHabit({ frequency: "weekly", dayOfWeek: 1 });
    expect(toHabitReminderPlan(habit)?.date).toEqual({ hour: 9, minute: 30, dayOfWeek: 2 });
  });

  it("plans a monthly reminder on the habit's day of month", () => {
    const habit = makeHabit({ frequency: "monthly", dayOfMonth: 15 });
    expect(toHabitReminderPlan(habit)?.date).toEqual({ hour: 9, minute: 30, dayOfMonth: 15 });
  });

  it("returns null when the habit has no reminder time set", () => {
    expect(toHabitReminderPlan(makeHabit({ hours: null }))).toBeNull();
    expect(toHabitReminderPlan(makeHabit({ minutes: null }))).toBeNull();
  });

  it("returns null for a completed habit, regardless of its schedule", () => {
    expect(toHabitReminderPlan(makeHabit({ completed: true }))).toBeNull();
  });
});

describe("scheduleHabitReminder", () => {
  it("schedules through the adapter when a plan exists", () => {
    const scheduleNotification = makeScheduleNotificationSpy();
    scheduleHabitReminder(scheduleNotification, makeHabit());
    expect(scheduleNotification.calls).toEqual([
      ["schedule", "daily", { id: "habit-1", title: "Read", message: HABIT_REMINDER_MESSAGE }, { hour: 9, minute: 30 }],
    ]);
  });

  it("cancels through the adapter instead of scheduling when the habit is completed", () => {
    const scheduleNotification = makeScheduleNotificationSpy();
    scheduleHabitReminder(scheduleNotification, makeHabit({ completed: true }));
    expect(scheduleNotification.calls).toEqual([["cancel", "habit-1"]]);
  });
});

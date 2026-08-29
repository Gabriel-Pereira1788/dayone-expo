import type { ScheduleNotificationImpl } from "@/infra/adapters/schedule-notification/types";
import type { ScheduleFrequency, Notification, ScheduleDate } from "@/infra/adapters/schedule-notification/types";
import type { HabitFrequency } from "@/modules/habit/domain/types";
import { HABIT_REMINDER_MESSAGE } from "./schedule-habit-reminder.constants";

export interface HabitReminderSource {
  id: string;
  title: string;
  frequency: HabitFrequency;
  hours: number | null;
  minutes: number | null;
  dayOfWeek: number | null;
  dayOfMonth: number | null;
  completed?: boolean;
}

export interface HabitReminderPlan {
  frequency: ScheduleFrequency;
  notification: Notification;
  date: ScheduleDate;
}

export function toHabitReminderPlan(habit: HabitReminderSource): HabitReminderPlan | null {
  if (habit.completed) return null;
  if (habit.hours == null || habit.minutes == null) return null;

  const notification: Notification = { id: habit.id, title: habit.title, message: HABIT_REMINDER_MESSAGE };
  const time = { hour: habit.hours, minute: habit.minutes };

  if (habit.frequency === "weekly") {
    return { frequency: "weekly", notification, date: { ...time, dayOfWeek: (habit.dayOfWeek ?? 0) + 1 } };
  }
  if (habit.frequency === "monthly") {
    return { frequency: "monthly", notification, date: { ...time, dayOfMonth: habit.dayOfMonth ?? 1 } };
  }
  return { frequency: "daily", notification, date: time };
}

export function scheduleHabitReminder(scheduleNotification: ScheduleNotificationImpl, habit: HabitReminderSource): void {
  const plan = toHabitReminderPlan(habit);
  if (!plan) {
    scheduleNotification.cancel(habit.id);
    return;
  }
  scheduleNotification.schedule(plan.frequency, plan.notification, plan.date);
}

import type { Habit } from "@/modules/habit/domain/types";
import { toDateKey } from "@/shared/helpers/date";

export function isHabitDueOn(habit: Habit, date: Date): boolean {
  const dateKey = toDateKey(date);
  if (habit.startDate && dateKey < habit.startDate.slice(0, 10)) return false;
  if (habit.endDate && dateKey > habit.endDate.slice(0, 10)) return false;

  switch (habit.frequency) {
    case "daily":
      return true;
    case "weekly":
      return date.getDay() === habit.dayOfWeek;
    case "monthly":
      return date.getDate() === habit.dayOfMonth;
    default:
      return true;
  }
}

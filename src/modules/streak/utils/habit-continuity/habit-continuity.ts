import type { Habit } from "@/modules/habit/domain/types";
import { isHabitDueOn } from "@/modules/habit/utils";
import { toDateKey } from "@/shared/helpers/date";
import type { DashMarkState } from "@/shared/ui";
import type { Streak } from "@/modules/streak/domain/types";
import { RECENT_OCCURRENCES, SCAN_LIMIT_DAYS } from "./habit-continuity.constants";

export function computeHabitDashMarks(habit: Habit, streaks: Streak[], today: Date): DashMarkState[] {
  const checkedDateKeys = new Set(
    streaks.filter((s) => s.habitId === habit.id).map((s) => toDateKey(new Date(s.createdAt))),
  );

  const marks: DashMarkState[] = [];
  const cursor = new Date(today);
  cursor.setDate(cursor.getDate() - 1);

  for (let scanned = 0; scanned < SCAN_LIMIT_DAYS && marks.length < RECENT_OCCURRENCES; scanned++) {
    if (isHabitDueOn(habit, cursor)) {
      marks.unshift(checkedDateKeys.has(toDateKey(cursor)) ? "done" : "gap");
    }
    cursor.setDate(cursor.getDate() - 1);
  }

  return marks;
}

export function countMissed(marks: DashMarkState[]): number {
  return marks.filter((mark) => mark === "gap").length;
}

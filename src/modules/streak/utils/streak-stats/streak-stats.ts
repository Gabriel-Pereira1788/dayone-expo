import type { Habit } from "@/modules/habit/domain/types";
import { isHabitDueOn } from "@/modules/habit/utils";
import { toDateKey } from "@/shared/helpers/date";
import type { Streak } from "@/modules/streak/domain/types";
import type { ContinuitySegment } from "@/shared/ui";
import { DEFAULT_LOOKBACK_DAYS } from "./streak-stats.constants";
import type { DayFlag, DayStreakStats } from "./streak-stats.types";

function isDayComplete(activeHabits: Habit[], checkedByDate: Map<string, Set<string>>, date: Date): boolean {
  const dueHabitIds = activeHabits.filter((habit) => isHabitDueOn(habit, date)).map((habit) => habit.id);
  if (dueHabitIds.length === 0) return true;
  const checkedIds = checkedByDate.get(toDateKey(date));
  return dueHabitIds.every((id) => checkedIds?.has(id));
}

export function computeDayStreakStats(
  habits: Habit[],
  streaks: Streak[],
  options: { today?: Date; lookbackDays?: number } = {},
): DayStreakStats {
  const today = options.today ?? new Date();
  const lookbackDays = options.lookbackDays ?? DEFAULT_LOOKBACK_DAYS;
  const todayKey = toDateKey(today);

  const activeHabits = habits.filter((habit) => !habit.completed);

  if (activeHabits.length === 0) {
    return { current: 0, best: 0, lastBreakDateKey: null, dailyFlags: [] };
  }

  const earliestStartKey = activeHabits
    .reduce((earliest, habit) => (habit.startDate < earliest ? habit.startDate : earliest), activeHabits[0].startDate)
    .slice(0, 10);

  const checkedByDate = new Map<string, Set<string>>();
  for (const streak of streaks) {
    const dateKey = toDateKey(new Date(streak.createdAt));
    const set = checkedByDate.get(dateKey) ?? new Set<string>();
    set.add(streak.habitId);
    checkedByDate.set(dateKey, set);
  }

  const dailyFlags: DayFlag[] = [];
  for (let offset = lookbackDays - 1; offset >= 0; offset--) {
    const date = new Date(today);
    date.setDate(date.getDate() - offset);
    const dateKey = toDateKey(date);
    if (dateKey < earliestStartKey) continue;
    dailyFlags.push({ dateKey, complete: isDayComplete(activeHabits, checkedByDate, date) });
  }

  let current = 0;
  let lastBreakDateKey: string | null = null;
  for (let i = dailyFlags.length - 1; i >= 0; i--) {
    const flag = dailyFlags[i];
    if (flag.dateKey === todayKey && !flag.complete) continue;
    if (flag.complete) {
      current++;
      continue;
    }
    lastBreakDateKey = flag.dateKey;
    break;
  }

  const historyFlags = dailyFlags.filter((flag) => flag.dateKey !== todayKey || flag.complete);
  let best = 0;
  let run = 0;
  for (const flag of historyFlags) {
    run = flag.complete ? run + 1 : 0;
    best = Math.max(best, run);
  }

  return { current, best: Math.max(best, current), lastBreakDateKey, dailyFlags };
}

export function buildContinuitySegments(dailyFlags: DayFlag[]): ContinuitySegment[] {
  const segments: ContinuitySegment[] = [];
  for (const flag of dailyFlags) {
    const last = segments[segments.length - 1];
    if (last && last.active === flag.complete) {
      last.length++;
    } else {
      segments.push({ length: 1, active: flag.complete });
    }
  }
  return segments;
}

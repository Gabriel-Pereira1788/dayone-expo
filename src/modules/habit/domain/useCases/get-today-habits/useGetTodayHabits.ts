import { useMemo } from "react";
import { useGetHabits } from "@/modules/habit/domain/useCases/get-habits";
import { isHabitDueOn } from "@/modules/habit/utils";
import type { Habit } from "@/modules/habit/domain/types";
import { useGetStreaks } from "@/modules/streak/domain/useCases/get-streaks";
import { buildContinuitySegments, computeDayStreakStats } from "@/modules/streak/utils";
import type { Streak } from "@/modules/streak/domain/types";
import { toDateKey } from "@/shared/helpers/date";

/**
 * The single source of truth for "what's due today and what's been done" —
 * shared by the ledger (design/ 1a) and the focus flow (design/ 1d) so the
 * two surfaces can never disagree about which habits remain open. Returns
 * raw data only (due-today habits, check-ins, streak stats) — each screen's
 * viewmodel shapes that into its own presentation rows.
 */
export function useGetTodayHabits() {
  const today = useMemo(() => new Date(), []);
  const todayKey = toDateKey(today);

  const { data: habits, isLoading: habitsLoading } = useGetHabits();
  const { data: streaks, isLoading: streaksLoading } = useGetStreaks();

  const activeHabits = useMemo(
    () => (habits ?? []).filter((habit: Habit) => !habit.completed),
    [habits],
  );
  const allStreaks: Streak[] = streaks ?? [];

  const checkedTodayByHabitId = useMemo(() => {
    const map = new Map<string, string>();
    for (const streak of allStreaks) {
      if (toDateKey(new Date(streak.createdAt)) === todayKey) {
        map.set(streak.habitId, streak.id);
      }
    }
    return map;
  }, [allStreaks, todayKey]);

  const completionCountByHabitId = useMemo(() => {
    const map = new Map<string, number>();
    for (const streak of allStreaks) {
      map.set(streak.habitId, (map.get(streak.habitId) ?? 0) + 1);
    }
    return map;
  }, [allStreaks]);

  const dueTodayHabits = useMemo(
    () => activeHabits.filter((habit) => isHabitDueOn(habit, today)),
    [activeHabits, today],
  );

  const openHabitIds = useMemo(
    () =>
      dueTodayHabits.filter((habit) => !checkedTodayByHabitId.has(habit.id)).map((habit) => habit.id),
    [dueTodayHabits, checkedTodayByHabitId],
  );

  const stats = useMemo(
    () => computeDayStreakStats(activeHabits, allStreaks, { today }),
    [activeHabits, allStreaks, today],
  );
  const segments = useMemo(() => buildContinuitySegments(stats.dailyFlags), [stats.dailyFlags]);

  return {
    isLoading: habitsLoading || streaksLoading,
    today,
    todayKey,
    activeHabits,
    allStreaks,
    dueTodayHabits,
    openHabitIds,
    checkedTodayByHabitId,
    completionCountByHabitId,
    dayIsClosed: dueTodayHabits.length > 0 && openHabitIds.length === 0,
    stats,
    segments,
  };
}

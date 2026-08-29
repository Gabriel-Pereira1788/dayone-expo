import { useMemo } from "react";
import { useRouter } from "expo-router";
import { useGetTodayHabits } from "@/modules/habit/domain/useCases/get-today-habits";
import { describeClosedDay, formatLedgerHeaderLabel, formatShortDate, formatTimeOfDay } from "@/modules/habit/utils";

export interface TodayLedgerRow {
  habitId: string;
  title: string;
  icon: string;
  status: "done" | "open";
  metaLabel: string;
  timesCompleted: number;
}

export function useHabitListScreenViewModel() {
  const router = useRouter();
  const {
    isLoading,
    today,
    todayKey,
    dueTodayHabits,
    dayIsClosed,
    stats,
    segments,
    checkedTodayByHabitId,
    completionCountByHabitId,
    allStreaks,
  } = useGetTodayHabits();

  const rows: TodayLedgerRow[] = useMemo(
    () =>
      dueTodayHabits.map((habit) => {
        const completedStreakId = checkedTodayByHabitId.get(habit.id);
        const timesCompleted = completionCountByHabitId.get(habit.id) ?? 0;
        if (completedStreakId) {
          const streak = allStreaks.find((s) => s.id === completedStreakId);
          const time = streak ? formatTimeOfDay(streak.createdAt) : "--:--";
          return {
            habitId: habit.id,
            title: habit.title,
            icon: habit.icon ?? "",
            status: "done" as const,
            metaLabel: `DONE ${time} · ${timesCompleted}`,
            timesCompleted,
          };
        }
        return {
          habitId: habit.id,
          title: habit.title,
          icon: habit.icon ?? "",
          status: "open" as const,
          metaLabel: `OPEN · ${timesCompleted}`,
          timesCompleted,
        };
      }),
    [dueTodayHabits, checkedTodayByHabitId, completionCountByHabitId, allStreaks],
  );

  const closedDayRows = useMemo(
    () =>
      rows
        .filter((row) => row.status === "done")
        .map((row) => {
          const streakId = checkedTodayByHabitId.get(row.habitId);
          const streak = allStreaks.find((s) => s.id === streakId);
          return {
            habitId: row.habitId,
            title: row.title,
            time: streak ? formatTimeOfDay(streak.createdAt) : "--:--",
          };
        }),
    [rows, checkedTodayByHabitId, allStreaks],
  );

  function openHabit(habitId: string, status: "done" | "open") {
    if (status === "open") {
      router.push({ pathname: "/(app)/habits/focus", params: { start: habitId } });
      return;
    }
    router.push({ pathname: "/(app)/habits/[id]", params: { id: habitId } });
  }

  function openNewHabit() {
    router.push("/(app)/habits/new");
  }

  function openProfile() {
    router.push("/(app)/profile");
  }

  return {
    isLoading,
    headerLabel: formatLedgerHeaderLabel(today),
    rows,
    dayIsClosed,
    stats,
    segments,
    lastBreakLabel: stats.lastBreakDateKey ? formatShortDate(stats.lastBreakDateKey) : "—",
    closedDay: {
      dateLabel: formatShortDate(todayKey),
      headline: describeClosedDay(closedDayRows.length),
      rows: closedDayRows,
    },
    openHabit,
    openNewHabit,
    openProfile,
  };
}

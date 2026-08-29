import { useMemo } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useGetHabit } from "@/modules/habit/domain/useCases/get-habit";
import { useGetHabitStreaks } from "@/modules/streak/domain/useCases/get-habit-streaks";
import { useDeleteHabit } from "@/modules/habit/domain/useCases/delete-habit";
import { useCheckInHabit } from "@/modules/streak/domain/useCases/check-in-habit";
import { useUncheckHabit } from "@/modules/streak/domain/useCases/uncheck-habit";
import { toDateKey } from "@/shared/helpers/date";
import { computeHabitDashMarks, countMissed } from "@/modules/streak/utils";

export function useHabitDetailScreenViewModel() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const today = useMemo(() => new Date(), []);

  const { data: habitRows, isLoading } = useGetHabit(id);
  const { data: streaks } = useGetHabitStreaks(id);
  const deleteHabit = useDeleteHabit();
  const checkInHabit = useCheckInHabit();
  const uncheckHabit = useUncheckHabit();

  const habit = habitRows?.[0] ?? null;
  const allStreaks = streaks ?? [];
  const todayKey = toDateKey(today);
  const todayStreak = allStreaks.find((streak) => toDateKey(new Date(streak.createdAt)) === todayKey);

  const dashMarks = useMemo(
    () => (habit ? computeHabitDashMarks(habit, allStreaks, today) : []),
    [habit, allStreaks, today],
  );

  function toggleCheck() {
    if (todayStreak) {
      uncheckHabit(todayStreak.id);
    } else {
      checkInHabit(id);
    }
  }

  function removeHabit() {
    deleteHabit(id);
    router.back();
  }

  function editHabit() {
    router.push({ pathname: "/(app)/habits/[id]/edit", params: { id } });
  }

  function goBack() {
    router.back();
  }

  return {
    habit,
    streaks: allStreaks,
    dashMarks,
    missedCount: countMissed(dashMarks),
    isLoading,
    checkedToday: Boolean(todayStreak),
    toggleCheck,
    removeHabit,
    editHabit,
    goBack,
  };
}

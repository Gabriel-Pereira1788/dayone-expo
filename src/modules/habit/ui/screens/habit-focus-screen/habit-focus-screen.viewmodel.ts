import { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useGetTodayHabits } from "@/modules/habit/domain/useCases/get-today-habits";
import { useCheckInHabit } from "@/modules/streak/domain/useCases/check-in-habit";
import { useUncheckHabit } from "@/modules/streak/domain/useCases/uncheck-habit";
import { computeHabitDashMarks, countMissed } from "@/modules/streak/utils";

export function useHabitFocusScreenViewModel() {
  const router = useRouter();
  const { start } = useLocalSearchParams<{ start?: string }>();
  const { isLoading, today, activeHabits, allStreaks, openHabitIds, checkedTodayByHabitId, stats } =
    useGetTodayHabits();
  const checkInHabit = useCheckInHabit();
  const uncheckHabit = useUncheckHabit();

  // Snapshot the queue order once the first habit's data lands, so the flow
  // doesn't reshuffle mid-session as completed habits drop out of `openHabitIds`.
  const [queueOrder, setQueueOrder] = useState<string[] | null>(null);

  useEffect(() => {
    if (queueOrder !== null || isLoading) return;
    const ids = [...openHabitIds];
    setQueueOrder(start && ids.includes(start) ? [start, ...ids.filter((id) => id !== start)] : ids);
  }, [isLoading, openHabitIds, start, queueOrder]);

  const remainingQueue = useMemo(
    () => (queueOrder ?? []).filter((id) => openHabitIds.includes(id)),
    [queueOrder, openHabitIds],
  );

  const currentHabitId = remainingQueue[0] ?? null;
  const currentHabit = activeHabits.find((habit) => habit.id === currentHabitId) ?? null;

  const dashMarks = useMemo(
    () => (currentHabit ? computeHabitDashMarks(currentHabit, allStreaks, today) : []),
    [currentHabit, allStreaks, today],
  );

  const isReady = !isLoading && queueOrder !== null;

  // Pops back to the ledger route we pushed from — never `replace`, which
  // would stack a second "/(app)/habits" instance underneath instead of
  // reusing the one already there (design/ 3b → 3c: same screen, new data).
  useEffect(() => {
    if (isReady && remainingQueue.length === 0) {
      router.back();
    }
  }, [isReady, remainingQueue.length, router]);

  function completeCurrent() {
    if (currentHabitId) checkInHabit(currentHabitId);
  }

  function undoCurrent() {
    if (!currentHabitId) return;
    const streakId = checkedTodayByHabitId.get(currentHabitId);
    if (streakId) uncheckHabit(streakId);
  }

  // No-op once the queue is empty — the effect above owns navigating away.
  function advance() {}

  return {
    isReady,
    currentHabit,
    dashMarks,
    missedCount: countMissed(dashMarks),
    remainingLabel: `${remainingQueue.length} LEFT TODAY`,
    streakNumber: stats.current,
    progressIndex: (queueOrder?.length ?? 0) - remainingQueue.length,
    progressTotal: queueOrder?.length ?? 0,
    completeCurrent,
    undoCurrent,
    advance,
  };
}

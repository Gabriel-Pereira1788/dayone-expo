import { uncheckHabitService } from "./uncheck-habit.service";

export function useUncheckHabit() {
  return (streakId: string): void => uncheckHabitService(streakId);
}

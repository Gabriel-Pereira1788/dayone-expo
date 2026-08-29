import { useStorage } from "@/infra/adapters/storage/hooks/useStorage";
import { checkInHabitService } from "./check-in-habit.service";

export function useCheckInHabit() {
  const storage = useStorage();

  return (habitId: string): string => checkInHabitService(storage, habitId);
}

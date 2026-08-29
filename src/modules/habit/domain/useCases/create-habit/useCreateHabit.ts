import { useStorage } from "@/infra/adapters/storage/hooks/useStorage";
import { useScheduleNotification } from "@/infra/adapters/schedule-notification/hooks/useScheduleNotification";
import { scheduleHabitReminder } from "@/modules/habit/utils/schedule-habit-reminder";
import { createHabitService } from "./create-habit.service";
import type { CreateHabitInput } from "../../types";

export function useCreateHabit() {
  const storage = useStorage();
  const scheduleNotification = useScheduleNotification();

  return (input: CreateHabitInput): string => {
    const id = createHabitService(storage, input);
    scheduleHabitReminder(scheduleNotification, { id, ...input });
    return id;
  };
}

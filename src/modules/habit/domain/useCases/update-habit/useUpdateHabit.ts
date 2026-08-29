import { useScheduleNotification } from "@/infra/adapters/schedule-notification/hooks/useScheduleNotification";
import { scheduleHabitReminder } from "@/modules/habit/utils/schedule-habit-reminder";
import { updateHabitService } from "./update-habit.service";
import type { UpdateHabitInput } from "../../types";

export function useUpdateHabit() {
  const scheduleNotification = useScheduleNotification();

  return (id: string, input: UpdateHabitInput): void => {
    const habit = updateHabitService(id, input);
    if (habit) scheduleHabitReminder(scheduleNotification, habit);
  };
}

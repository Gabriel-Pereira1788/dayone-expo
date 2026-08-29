import { useScheduleNotification } from "@/infra/adapters/schedule-notification/hooks/useScheduleNotification";
import { deleteHabitService } from "./delete-habit.service";

export function useDeleteHabit() {
  const scheduleNotification = useScheduleNotification();

  return (id: string): void => {
    deleteHabitService(id);
    scheduleNotification.cancel(id);
  };
}

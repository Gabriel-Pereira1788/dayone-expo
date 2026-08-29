import { deleteHabitService } from "./delete-habit.service";

export function useDeleteHabit() {
  return (id: string): void => deleteHabitService(id);
}

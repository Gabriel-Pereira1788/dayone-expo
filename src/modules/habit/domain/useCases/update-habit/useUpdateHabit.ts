import { updateHabitService } from "./update-habit.service";
import type { UpdateHabitInput } from "../../types";

export function useUpdateHabit() {
  return (id: string, input: UpdateHabitInput): void => updateHabitService(id, input);
}

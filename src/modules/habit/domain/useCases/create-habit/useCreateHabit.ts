import { useStorage } from "@/infra/adapters/storage/hooks/useStorage";
import { createHabitService } from "./create-habit.service";
import type { CreateHabitInput } from "../../types";

export function useCreateHabit() {
  const storage = useStorage();

  return (input: CreateHabitInput): string => createHabitService(storage, input);
}

import { Database, eq } from "@salve-software/react-native-salve-db";
import { HabitSchema } from "@/infra/db/schemas";
import type { Habit, UpdateHabitInput } from "../../types";

// Same RFC3339 requirement as createHabitService — see comment there.
function toRFC3339(dateOnly: string): string {
  return dateOnly.includes("T") ? dateOnly : `${dateOnly}T00:00:00.000Z`;
}

export function updateHabitService(id: string, input: UpdateHabitInput): Habit | null {
  const [existing] = Database.select(HabitSchema).where(eq("id", id)).limit(1).execute();
  if (!existing) return null;

  const { startDate, endDate, ...rest } = input;
  const patch = {
    ...rest,
    ...(startDate ? { startDate: toRFC3339(startDate) } : {}),
    ...(endDate ? { endDate: toRFC3339(endDate) } : {}),
    updatedAt: Date.now(),
  };

  Database.update(HabitSchema).set(patch).where(eq("id", id)).execute();

  return { ...existing, ...patch } as Habit;
}

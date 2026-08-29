import { Database, eq } from "@salve-software/react-native-salve-db";
import { HabitSchema } from "@/infra/db/schemas";
import type { UpdateHabitInput } from "../../types";

// Same RFC3339 requirement as createHabitService — see comment there.
function toRFC3339(dateOnly: string): string {
  return dateOnly.includes("T") ? dateOnly : `${dateOnly}T00:00:00.000Z`;
}

export function updateHabitService(id: string, input: UpdateHabitInput): void {
  const { startDate, endDate, ...rest } = input;

  Database.update(HabitSchema)
    .set({
      ...rest,
      ...(startDate ? { startDate: toRFC3339(startDate) } : {}),
      ...(endDate ? { endDate: toRFC3339(endDate) } : {}),
      updatedAt: Date.now(),
    })
    .where(eq("id", id))
    .execute();
}

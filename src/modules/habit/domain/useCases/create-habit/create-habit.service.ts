import { Database } from "@salve-software/react-native-salve-db";
import * as Crypto from "expo-crypto";
import { HabitSchema } from "@/infra/db/schemas";
import type { StorageImpl } from "@/infra/adapters/storage/types";
import { StorageKeys } from "@/infra/adapters/storage/types";
import type { AuthPayload } from "@/modules/auth/domain/types";
import type { CreateHabitInput } from "../../types";

// The Go backend's habits.CreateInput decodes startDate/endDate as
// time.Time, which requires full RFC3339 — a bare "YYYY-MM-DD" (what the
// date inputs collect) fails to parse and the whole request 400s. The value
// stored here is pushed to the API verbatim, so it must already be RFC3339.
function toRFC3339(dateOnly: string): string {
  return dateOnly.includes("T") ? dateOnly : `${dateOnly}T00:00:00.000Z`;
}

export function createHabitService(storage: StorageImpl, input: CreateHabitInput): string {
  const session = storage.getItemSync<AuthPayload>(StorageKeys.SESSION);
  const id = Crypto.randomUUID();

  Database.insert(HabitSchema)
    .values({
      id,
      userId: session?.User.ID ?? "",
      title: input.title,
      description: input.description,
      icon: input.icon,
      frequency: input.frequency,
      dayOfWeek: input.dayOfWeek,
      dayOfMonth: input.dayOfMonth,
      hours: input.hours,
      minutes: input.minutes,
      startDate: toRFC3339(input.startDate),
      targetDurationInDays: input.targetDurationInDays,
      updatedAt: Date.now(),
      // nullable — omit entirely instead of sending "" (Go rejects an
      // empty string as an invalid time.Time, but a missing/null field
      // is a valid absent *time.Time).
      ...(input.endDate ? { endDate: toRFC3339(input.endDate) } : {}),
    })
    .execute();

  return id;
}

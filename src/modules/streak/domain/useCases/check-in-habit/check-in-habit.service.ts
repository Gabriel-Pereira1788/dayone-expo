import { Database } from "@salve-software/react-native-salve-db";
import * as Crypto from "expo-crypto";
import { StreakSchema } from "@/infra/db/schemas";
import type { StorageImpl } from "@/infra/adapters/storage/types";
import { StorageKeys } from "@/infra/adapters/storage/types";
import type { AuthPayload } from "@/modules/auth/domain/types";

export function checkInHabitService(storage: StorageImpl, habitId: string): string {
  const session = storage.getItemSync<AuthPayload>(StorageKeys.SESSION);
  const id = Crypto.randomUUID();

  Database.insert(StreakSchema)
    .values({
      id,
      userId: session?.User.ID ?? "",
      habitId,
      createdAt: new Date().toISOString(),
      updatedAt: Date.now(),
    })
    .execute();

  return id;
}

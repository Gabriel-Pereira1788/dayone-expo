import { Database, eq } from "@salve-software/react-native-salve-db";
import { StreakSchema } from "@/infra/db/schemas";

export function uncheckHabitService(streakId: string): void {
  Database.delete(StreakSchema).where(eq("id", streakId)).execute();
}

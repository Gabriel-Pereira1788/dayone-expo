import { Database, eq } from "@salve-software/react-native-salve-db";
import { HabitSchema } from "@/infra/db/schemas";

export function deleteHabitService(id: string): void {
  Database.delete(HabitSchema).where(eq("id", id)).execute();
}

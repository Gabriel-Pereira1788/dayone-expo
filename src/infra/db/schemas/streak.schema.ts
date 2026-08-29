import type { ISchemaDefinition } from "@salve-software/react-native-salve-db";
import type { Streak } from "@/modules/streak/domain/types";

export const StreakSchema = {
  name: "streaks",
  version: 1,
  primaryKey: "id",
  columns: {
    id: { type: "text" },
    userId: { type: "text" },
    habitId: { type: "text" },
    createdAt: { type: "text" },
    updatedAt: { type: "datetime", nullable: false },
  },
  indexes: [
    { name: "idx_streaks_updated_at", columns: ["updatedAt"] },
    { name: "idx_streaks_habit_id", columns: ["habitId"] },
    { name: "idx_streaks_created_at", columns: ["createdAt"] },
    { name: "idx_streaks_user_id", columns: ["userId"] },
  ],
  relations: [{ column: "habitId", references: "habits" }],
  sync: {
    enabled: true,
    direction: "bidirectional",
    conflict: { strategy: "lastWriteWins" },
    transport: "rest",
    endpoint: { basePath: "/streaks", listQueryTemplate: "updatedAfter={since}&limit={limit}" },
    pagination: { pageSize: 200, maxPagesPerSession: 20 },
  },
} satisfies ISchemaDefinition<Streak>;

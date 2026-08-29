import type { ISchemaDefinition } from "@salve-software/react-native-salve-db";
import type { Habit } from "@/modules/habit/domain/types";

export const HabitSchema = {
  name: "habits",
  version: 1,
  primaryKey: "id",
  columns: {
    id: { type: "text" },
    userId: { type: "text" },
    title: { type: "text" },
    description: { type: "text", nullable: true },
    icon: { type: "text", nullable: true },
    frequency: { type: "text" },
    dayOfWeek: { type: "integer", nullable: true },
    dayOfMonth: { type: "integer", nullable: true },
    hours: { type: "integer", nullable: true },
    minutes: { type: "integer", nullable: true },
    startDate: { type: "text" },
    endDate: { type: "text", nullable: true },
    targetDurationInDays: { type: "integer", nullable: true },
    completed: { type: "boolean", default: false },
    updatedAt: { type: "datetime", nullable: false },
  },
  indexes: [
    { name: "idx_habits_updated_at", columns: ["updatedAt"] },
    { name: "idx_habits_user_id", columns: ["userId"] },
  ],
  sync: {
    enabled: true,
    direction: "bidirectional",
    conflict: { strategy: "lastWriteWins" },
    transport: "rest",
    endpoint: { basePath: "/habits", listQueryTemplate: "updatedAfter={since}&limit={limit}" },
    pagination: { pageSize: 200, maxPagesPerSession: 20 },
  },
} satisfies ISchemaDefinition<Habit>;

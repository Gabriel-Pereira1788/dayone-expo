import { eq, useQuery } from "@salve-software/react-native-salve-db";
import { HabitSchema } from "@/infra/db/schemas";
import type { Habit } from "@/modules/habit/domain/types";
import { useCurrentUserId } from "@/modules/auth/domain/useCases/get-current-user-id";

export function useGetHabits() {
  const userId = useCurrentUserId();
  const result = useQuery({
    schema: HabitSchema,
    queryFn: (q) => q.where(eq("userId", userId)).orderBy("updatedAt", "desc").limit(200),
    deps: [userId],
  });
  // The schema types `frequency` as a plain string column; this is the one
  // place we assert it's actually a `HabitFrequency` literal, since every
  // write path (create/update-habit) only ever stores one of the three.
  return { ...result, data: result.data as Habit[] | undefined };
}

import { and, eq, useQuery } from "@salve-software/react-native-salve-db";
import { HabitSchema } from "@/infra/db/schemas";
import type { Habit } from "@/modules/habit/domain/types";
import { useCurrentUserId } from "@/modules/auth/domain/useCases/get-current-user-id";

export function useGetHabit(id: string) {
  const userId = useCurrentUserId();
  const result = useQuery({
    schema: HabitSchema,
    queryFn: (q) => q.where(and(eq("id", id), eq("userId", userId))).limit(1),
    deps: [id, userId],
  });
  return { ...result, data: result.data as Habit[] | undefined };
}

import { and, eq, useQuery } from "@salve-software/react-native-salve-db";
import { StreakSchema } from "@/infra/db/schemas";
import { useCurrentUserId } from "@/modules/auth/domain/useCases/get-current-user-id";

export function useGetHabitStreaks(habitId: string) {
  const userId = useCurrentUserId();
  return useQuery({
    schema: StreakSchema,
    queryFn: (q) => q.where(and(eq("userId", userId), eq("habitId", habitId))).orderBy("createdAt", "desc").limit(365),
    deps: [userId, habitId],
  });
}

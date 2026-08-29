import { and, eq, gte, useQuery } from "@salve-software/react-native-salve-db";
import { StreakSchema } from "@/infra/db/schemas";
import { toDateKey } from "@/shared/helpers/date";
import { useCurrentUserId } from "@/modules/auth/domain/useCases/get-current-user-id";

const LOOKBACK_DAYS = 400;

function lookbackCutoffKey(): string {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - LOOKBACK_DAYS);
  return toDateKey(cutoff);
}

/** All check-ins (across every habit) within the streak lookback window, for continuity math. */
export function useGetStreaks() {
  const userId = useCurrentUserId();
  const cutoffKey = lookbackCutoffKey();
  return useQuery({
    schema: StreakSchema,
    queryFn: (q) => q.where(and(eq("userId", userId), gte("createdAt", cutoffKey))).orderBy("createdAt", "desc").limit(500),
    deps: [userId, cutoffKey],
  });
}

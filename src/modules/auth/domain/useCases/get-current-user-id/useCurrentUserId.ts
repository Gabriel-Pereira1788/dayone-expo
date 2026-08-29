import { useStorage } from "@/infra/adapters/storage/hooks/useStorage";
import { StorageKeys } from "@/infra/adapters/storage/types";
import type { AuthPayload } from "@/modules/auth/domain/types";

export function useCurrentUserId(): string {
  const storage = useStorage();
  const session = storage.getItemSync<AuthPayload>(StorageKeys.SESSION);
  return session?.User.ID ?? "";
}

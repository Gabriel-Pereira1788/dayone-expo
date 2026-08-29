import { Redirect } from "expo-router";
import { useStorage } from "@/infra/adapters/storage/hooks/useStorage";
import { StorageKeys } from "@/infra/adapters/storage/types";
import type { AuthPayload } from "@/modules/auth/domain/types";

export default function Index() {
  const storage = useStorage();
  const session = storage.getItemSync<AuthPayload>(StorageKeys.SESSION);

  if (session?.AccessToken) {
    return <Redirect href="/(app)/habits" />;
  }

  return <Redirect href="/(auth)/login" />;
}

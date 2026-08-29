import { Database } from "@salve-software/react-native-salve-db";
import type { StorageImpl } from "@/infra/adapters/storage/types";
import { StorageKeys } from "@/infra/adapters/storage/types";

interface LogoutServiceDeps {
  storage: StorageImpl;
}

export async function logoutService({ storage }: LogoutServiceDeps): Promise<void> {
  await Database.logout();
  storage.removeItem(StorageKeys.SESSION);
}

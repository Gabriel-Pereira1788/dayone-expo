import type { AuthServiceImpl } from "@/infra/adapters/auth/types";
import type { StorageImpl } from "@/infra/adapters/storage/types";
import { StorageKeys } from "@/infra/adapters/storage/types";
import type { AuthPayload, RegisterInput } from "../../types";

interface RegisterServiceDeps {
  authService: AuthServiceImpl;
  storage: StorageImpl;
}

export async function registerService(
  { authService, storage }: RegisterServiceDeps,
  input: RegisterInput,
): Promise<AuthPayload> {
  const payload: AuthPayload = await authService.register(input);
  storage.setItem(StorageKeys.SESSION, payload);
  return payload;
}

import type { AuthServiceImpl } from "@/infra/adapters/auth/types";
import type { StorageImpl } from "@/infra/adapters/storage/types";
import { StorageKeys } from "@/infra/adapters/storage/types";
import type { AuthPayload, LoginInput } from "../../types";

interface LoginServiceDeps {
  authService: AuthServiceImpl;
  storage: StorageImpl;
}

export async function loginService(
  { authService, storage }: LoginServiceDeps,
  input: LoginInput,
): Promise<AuthPayload> {
  const payload: AuthPayload = await authService.login(input);
  console.log("Payload", payload);

  storage.setItem(StorageKeys.SESSION, payload);
  return payload;
}

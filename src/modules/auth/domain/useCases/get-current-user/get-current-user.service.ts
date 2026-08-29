import type { AuthServiceImpl } from "@/infra/adapters/auth/types";
import type { CurrentUser } from "../../types";

export async function getCurrentUserService(
  authService: AuthServiceImpl,
): Promise<CurrentUser> {
  return authService.getCurrentUser();
}

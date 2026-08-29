import { useRouter } from "expo-router";
import { useStorage } from "@/infra/adapters/storage/hooks/useStorage";
import { StorageKeys } from "@/infra/adapters/storage/types";
import type { AuthPayload } from "@/modules/auth/domain/types";
import { useLogout } from "@/modules/auth/domain/useCases/logout";

export function useProfileScreenViewModel() {
  const router = useRouter();
  const storage = useStorage();
  const logout = useLogout();

  const session = storage.getItemSync<AuthPayload>(StorageKeys.SESSION);

  function goBack() {
    router.back();
  }

  return {
    name: session?.User.Name ?? "",
    email: session?.User.Email ?? "",
    isLoggingOut: logout.isPending,
    signOut: logout.mutate,
    goBack,
  };
}

import { useQuery } from "@tanstack/react-query";
import { useAuthService } from "@/infra/adapters/auth/hooks/useAuthService";
import { getCurrentUserService } from "./get-current-user.service";

export function useGetCurrentUser() {
  const authService = useAuthService();

  return useQuery({
    queryKey: ["auth", "current-user"],
    queryFn: () => getCurrentUserService(authService),
  });
}

import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useAuthService } from "@/infra/adapters/auth/hooks/useAuthService";
import { useStorage } from "@/infra/adapters/storage/hooks/useStorage";
import { loginService } from "./login.service";
import type { LoginInput } from "../../types";

export function useLogin() {
  const authService = useAuthService();
  const storage = useStorage();

  return useMutation({
    mutationFn: (input: LoginInput) => loginService({ authService, storage }, input),
    onSuccess: () => {
      console.log("SUCCESS")
      router.replace("/(app)/habits");
    },
    onError: (err) => {
      console.error(err);
    },
  });
}

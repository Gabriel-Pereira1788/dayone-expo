import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useAuthService } from "@/infra/adapters/auth/hooks/useAuthService";
import { useStorage } from "@/infra/adapters/storage/hooks/useStorage";
import { registerService } from "./register.service";
import type { RegisterInput } from "../../types";

export function useRegister() {
  const authService = useAuthService();
  const storage = useStorage();

  return useMutation({
    mutationFn: (input: RegisterInput) => registerService({ authService, storage }, input),
    onSuccess: () => {
      router.replace("/(app)/habits");
    },
    onError: (err) => {
      console.error(err);
    },
  });
}

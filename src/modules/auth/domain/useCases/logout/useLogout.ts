import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useStorage } from "@/infra/adapters/storage/hooks/useStorage";
import { logoutService } from "./logout.service";

export function useLogout() {
  const storage = useStorage();

  return useMutation({
    mutationFn: () => logoutService({ storage }),
    onSuccess: () => {
      router.replace("/(auth)/login");
    },
    onError: (err) => {
      console.error(err);
    },
  });
}

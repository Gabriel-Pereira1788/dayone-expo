import { useMutation } from "@tanstack/react-query";
import { useStorage } from "@/infra/adapters/storage/hooks/useStorage";
import { signInWithDeviceService } from "./sign-in-with-device.service";

export function useSignInWithDevice() {
  const storage = useStorage();

  return useMutation({
    mutationFn: () => signInWithDeviceService(storage),
  });
}

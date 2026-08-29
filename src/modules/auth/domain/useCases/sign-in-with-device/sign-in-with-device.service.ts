import { axiosHttpClientImpl } from "@/infra/api";
import { getDeviceId } from "@/infra/device-identity";
import type { AuthPayloadDTO } from "@/infra/adapters/auth/types";
import type { StorageImpl } from "@/infra/adapters/storage/types";
import { StorageKeys } from "@/infra/adapters/storage/types";
import type { AuthPayload } from "../../types";

export async function signInWithDeviceService(storage: StorageImpl): Promise<AuthPayload> {
  const deviceId = await getDeviceId();
  const { data } = await axiosHttpClientImpl.post<AuthPayloadDTO>("/auth/device", { deviceId });

  storage.setItem(StorageKeys.SESSION, data);
  return data;
}

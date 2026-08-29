import * as Crypto from "expo-crypto";
import { axiosHttpClientImpl } from "@/infra/api";
import type { AuthPayloadDTO } from "@/infra/adapters/auth/types";
import type { StorageImpl } from "@/infra/adapters/storage/types";
import { StorageKeys } from "@/infra/adapters/storage/types";
import type { AuthPayload } from "../../types";

function getOrCreateDeviceId(storage: StorageImpl): string {
  const existing = storage.getItemSync<string>(StorageKeys.DEVICE_ID);
  if (existing) return existing;

  const deviceId = Crypto.randomUUID();
  storage.setItem(StorageKeys.DEVICE_ID, deviceId);
  return deviceId;
}

export async function signInWithDeviceService(storage: StorageImpl): Promise<AuthPayload> {
  const deviceId = getOrCreateDeviceId(storage);
  const { data } = await axiosHttpClientImpl.post<AuthPayloadDTO>("/auth/device", { deviceId });

  storage.setItem(StorageKeys.SESSION, data);
  return data;
}

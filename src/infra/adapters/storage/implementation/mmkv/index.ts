import { createMMKV } from "react-native-mmkv";
import { StorageImpl } from "../../types";

const mmkv = createMMKV();

function setItem<T>(key: string, value: T) {
  mmkv.set(key, JSON.stringify(value));
}

async function getItem<T>(key: string): Promise<T | null> {
  const data = mmkv.getString(key);
  if (!data) {
    return null;
  }
  return JSON.parse(data) as T;
}

function getItemSync<T>(key: string): T | null {
  const data = mmkv.getString(key);
  if (!data) {
    return null;
  }
  return JSON.parse(data) as T;
}

function removeItem(key: string) {
  mmkv.remove(key);
}

function clearAll() {
  mmkv.clearAll();
}

export const mmkvImpl: StorageImpl = {
  setItem,
  getItem,
  getItemSync,
  removeItem,
  clearAll,
};

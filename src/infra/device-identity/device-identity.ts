import { Platform } from "react-native";
import * as Application from "expo-application";
import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";

const DEVICE_UUID_KEY = "dayone.device.uuid";

// iOS: Keychain (via expo-secure-store) survives app uninstall/reinstall on the
// same device — unlike MMKV/AsyncStorage, which live in the app's sandbox and
// are wiped on uninstall. AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY keeps the value
// off iCloud Keychain sync, so it never migrates to a different physical
// iPhone the same Apple ID owns.
async function getOrCreatePersistedUuid(): Promise<string> {
  const existing = await SecureStore.getItemAsync(DEVICE_UUID_KEY);
  if (existing) return existing;

  const uuid = Crypto.randomUUID();
  await SecureStore.setItemAsync(DEVICE_UUID_KEY, uuid, {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  });
  return uuid;
}

// Android: Settings.Secure.ANDROID_ID (SSAID) lives in the system's
// SettingsProvider, outside the app's own data directory, so it survives
// uninstall/reinstall as long as the package name and signing key are
// unchanged (confirmed by the official Android Developers Blog post on
// Android 8 device identifier changes). It only resets on factory reset or
// a signing-key change between installs. Falls back to the same
// Keychain-equivalent persisted UUID as iOS if it's ever unavailable.
export async function getDeviceId(): Promise<string> {
  if (Platform.OS === "android") {
    const androidId = Application.getAndroidId();
    if (androidId) return androidId;
  }
  return getOrCreatePersistedUuid();
}

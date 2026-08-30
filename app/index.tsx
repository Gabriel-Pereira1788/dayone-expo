import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { useTheme } from "@shopify/restyle";
import { useStorage } from "@/infra/adapters/storage/hooks/useStorage";
import { StorageKeys } from "@/infra/adapters/storage/types";
import type { AuthPayload } from "@/modules/auth/domain/types";
import { useSignInWithDevice } from "@/modules/auth/domain/useCases/sign-in-with-device";
import { AppText, Button } from "@/shared/ui";
import type { Theme } from "@/styles";

// Every account is device-id-backed — there is no login screen. A returning
// device with a stored session skips straight in; a first launch (or a
// device id the backend has never seen) silently provisions one.
export default function Index() {
  const theme = useTheme<Theme>();
  const storage = useStorage();
  const existingSession = storage.getItemSync<AuthPayload>(StorageKeys.SESSION);
  const signInWithDevice = useSignInWithDevice();

  useEffect(() => {
    if (!existingSession?.AccessToken) {
      signInWithDevice.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once at boot, not on every render
  }, []);

  if (existingSession?.AccessToken || signInWithDevice.data?.AccessToken) {
    return <Redirect href="/(app)/habits" />;
  }

  if (signInWithDevice.isError) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: theme.spacing.sp16, padding: theme.spacing.sp24, backgroundColor: theme.colors.pageBackground }}>
        <AppText variant="body" tone="error">
          Não foi possível conectar. Verifique sua internet.
        </AppText>
        <Button label="Tentar novamente" onPress={() => signInWithDevice.mutate()} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.pageBackground }}>
      <ActivityIndicator color={theme.colors.buttonPrimaryBackground} />
    </View>
  );
}

import { useEffect } from "react";
import { Redirect, Stack, useRouter } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";
import { useTheme } from "@shopify/restyle";
import {
  SalveDbProvider,
  useDatabaseReady,
} from "@salve-software/react-native-salve-db";
import { useStorage } from "@/infra/adapters/storage/hooks/useStorage";
import { useScheduleNotification } from "@/infra/adapters/schedule-notification/hooks/useScheduleNotification";
import { StorageKeys } from "@/infra/adapters/storage/types";
import type { AuthPayload } from "@/modules/auth/domain/types";
import { salveDbSchemas } from "@/infra/db/schemas";
import type { Theme } from "@/styles";

// Database.insert/update/delete throw synchronously if called before
// Database.configure() finishes — unlike useQuery, which gates on
// useDatabaseReady() internally. Gating the whole (app) route tree here
// prevents write screens from mounting (and racing a submit) before the
// SalveDbProvider's mount effect has actually run.
function AppShell() {
  const theme = useTheme<Theme>();
  const router = useRouter();
  const scheduleNotification = useScheduleNotification();
  const { isReady, isLoading, error } = useDatabaseReady();

  useEffect(() => {
    return scheduleNotification.addListener((habitId) => {
      router.push({ pathname: "/(app)/habits/focus", params: { start: habitId } });
    });
  }, [scheduleNotification, router]);

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: theme.spacing.sp24,
        }}
      >
        <Text
          style={{ color: theme.colors.feedbackError, textAlign: "center" }}
        >
          Não foi possível iniciar o banco local: {String(error)}
        </Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        {isLoading && (
          <ActivityIndicator color={theme.colors.buttonPrimaryBackground} />
        )}
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="habits" />
      <Stack.Screen name="profile" options={{ presentation: "modal" }} />
    </Stack>
  );
}

export default function AppLayout() {
  const storage = useStorage();
  const session = storage.getItemSync<AuthPayload>(StorageKeys.SESSION);
  console.log("Session", session);
  if (!session?.AccessToken) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <SalveDbProvider
      key={session.User.ID}
      config={{
        name: "dayone-db",
        baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? "",
        network: {
          timeout: 5000,
        },
        credentials: {
          provider: "oauth2",
          // accessTokenScheme defaults to "Bearer" as of salve-db 1.0.0,
          // matching the backend's standard Authorization header path
          // (internal/auth/middleware.go) — no header override needed.
          tokens: {
            accessToken: session.AccessToken,
            refreshToken: session.RefreshToken,
          },
          refresh: {
            endpoint: "/auth/refresh",
            response: {
              accessToken: "$.AccessToken",
              refreshToken: "$.RefreshToken",
            },
          },
        },
        syncOnAppOpen: true,
      }}
      schemas={salveDbSchemas}
    >
      <AppShell />
    </SalveDbProvider>
  );
}

import "../global.css";
import { useEffect } from "react";
import { Slot } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@shopify/restyle";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { HeroUINativeProvider } from "heroui-native";
import Salvetron from "@salve-software/salvetron-react-native";
import { theme } from "@/styles";
import { FONT_ASSETS } from "@/styles/fonts";
import { DIProvider } from "@/infra/DI/context/DIContext";
import { DIKeys } from "@/infra/DI/types";
import { mmkvImpl } from "@/infra/adapters/storage/implementation/mmkv";
import { restAuthServiceImpl } from "@/infra/adapters/auth/implementation/rest";

if (__DEV__) {
  Salvetron.connect({ host: "localhost", enableNetworkCapture: true });
}

const queryClient = new QueryClient();

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(FONT_ASSETS);
  const ready = fontsLoaded || Boolean(fontError);

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <HeroUINativeProvider>
          <SafeAreaProvider>
            <QueryClientProvider client={queryClient}>
              <ThemeProvider theme={theme}>
                <DIProvider
                  config={(container) => {
                    container.registerService(DIKeys.Storage, mmkvImpl);
                    container.registerService(DIKeys.AuthService, restAuthServiceImpl);
                  }}
                >
                  <StatusBar style="auto" />
                  <Slot />
                </DIProvider>
              </ThemeProvider>
            </QueryClientProvider>
          </SafeAreaProvider>
        </HeroUINativeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

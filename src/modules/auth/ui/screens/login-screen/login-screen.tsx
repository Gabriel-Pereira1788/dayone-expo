import { Controller } from "react-hook-form";
import { Pressable } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { AppText, FormField, LedgerButton, MonoLabel } from "@/shared/ui";
import { useLoginScreenViewModel } from "./login-screen.viewmodel";
import { useLoginScreenStyles } from "./login-screen.styles";

export function LoginScreen() {
  const { form, onSubmit, isPending, error } = useLoginScreenViewModel();
  const styles = useLoginScreenStyles();
  const errors = form.formState.errors;

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <KeyboardAwareScrollView
        mode="layout"
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AppText variant="title">Entrar</AppText>

        <Controller
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormField
              label="Email"
              required
              value={field.value}
              onChangeText={field.onChange}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email?.message}
            />
          )}
        />

        <Controller
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormField
              label="Senha"
              required
              value={field.value}
              onChangeText={field.onChange}
              secureTextEntry
              error={errors.password?.message}
            />
          )}
        />

        {error ? (
          <AppText variant="body" tone="error">
            Email ou senha inválidos
          </AppText>
        ) : null}

        <LedgerButton label={isPending ? "Entrando..." : "Entrar"} onPress={onSubmit} disabled={isPending} />

        <Link href="/(auth)/register" asChild>
          <Pressable style={styles.link} hitSlop={12}>
            <MonoLabel tone="muted">NÃO TEM CONTA? CADASTRE-SE</MonoLabel>
          </Pressable>
        </Link>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

import { Controller } from "react-hook-form";
import { Pressable } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { AppText, FormField, LedgerButton, MonoLabel } from "@/shared/ui";
import { useRegisterScreenViewModel } from "./register-screen.viewmodel";
import { useRegisterScreenStyles } from "./register-screen.styles";

export function RegisterScreen() {
  const { form, onSubmit, isPending, error } = useRegisterScreenViewModel();
  const styles = useRegisterScreenStyles();
  const errors = form.formState.errors;

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <KeyboardAwareScrollView
        mode="layout"
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AppText variant="title">Criar conta</AppText>

        <Controller
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormField
              label="Nome"
              required
              value={field.value}
              onChangeText={field.onChange}
              error={errors.name?.message}
            />
          )}
        />

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
            Não foi possível criar a conta
          </AppText>
        ) : null}

        <LedgerButton label={isPending ? "Criando..." : "Criar conta"} onPress={onSubmit} disabled={isPending} />

        <Link href="/(auth)/login" asChild>
          <Pressable style={styles.link} hitSlop={12}>
            <MonoLabel tone="muted">JÁ TEM CONTA? ENTRAR</MonoLabel>
          </Pressable>
        </Link>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

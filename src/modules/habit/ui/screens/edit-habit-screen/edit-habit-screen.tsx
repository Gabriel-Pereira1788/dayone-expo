import { Controller } from "react-hook-form";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { AppText, FormField, LedgerButton, MonoLabel, SegmentedControl } from "@/shared/ui";
import { FREQUENCY_OPTIONS } from "@/modules/habit/utils";
import { useEditHabitScreenViewModel } from "./edit-habit-screen.viewmodel";
import { useEditHabitScreenStyles } from "./edit-habit-screen.styles";

export function EditHabitScreen() {
  const { form, onSubmit, habit, cancel } = useEditHabitScreenViewModel();
  const styles = useEditHabitScreenStyles();
  const errors = form.formState.errors;

  if (!habit) {
    return null;
  }

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <Pressable onPress={cancel} hitSlop={12} style={styles.cancelRow}>
        <MonoLabel tone="faint">CANCELAR</MonoLabel>
      </Pressable>

      <KeyboardAwareScrollView
        mode="layout"
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AppText variant="title">Editar hábito</AppText>

        <Controller
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormField label="Título" required value={field.value} onChangeText={field.onChange} error={errors.title?.message} />
          )}
        />

        <Controller
          control={form.control}
          name="description"
          render={({ field }) => <FormField label="Descrição" value={field.value ?? ""} onChangeText={field.onChange} />}
        />

        <Controller
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormField label="Ícone (emoji)" value={field.value ?? ""} onChangeText={field.onChange} />
          )}
        />

        <Controller
          control={form.control}
          name="frequency"
          render={({ field }) => (
            <SegmentedControl options={FREQUENCY_OPTIONS} value={field.value} onChange={field.onChange} />
          )}
        />

        <Controller
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormField
              label="Data de início"
              required
              placeholder="YYYY-MM-DD"
              value={field.value}
              onChangeText={field.onChange}
              error={errors.startDate?.message}
            />
          )}
        />

        <Controller
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormField
              label="Data de fim (opcional)"
              placeholder="YYYY-MM-DD"
              value={field.value ?? ""}
              onChangeText={field.onChange}
            />
          )}
        />

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Controller
              control={form.control}
              name="hours"
              render={({ field }) => (
                <FormField label="Hora" keyboardType="numeric" value={field.value ?? ""} onChangeText={field.onChange} />
              )}
            />
          </View>
          <View style={styles.rowItem}>
            <Controller
              control={form.control}
              name="minutes"
              render={({ field }) => (
                <FormField label="Minuto" keyboardType="numeric" value={field.value ?? ""} onChangeText={field.onChange} />
              )}
            />
          </View>
        </View>

        <LedgerButton label="Salvar alterações" onPress={onSubmit} />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

import { Controller } from "react-hook-form";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { AppText, Button, FormField, MonoLabel, SegmentedControl } from "@/shared/ui";
import { DAY_OF_WEEK_OPTIONS, FREQUENCY_OPTIONS } from "@/modules/habit/utils";
import { useNewHabitScreenViewModel } from "./new-habit-screen.viewmodel";
import { useNewHabitScreenStyles } from "./new-habit-screen.styles";

export function NewHabitScreen() {
  const { form, onSubmit, cancel, frequency } = useNewHabitScreenViewModel();
  const styles = useNewHabitScreenStyles();
  const errors = form.formState.errors;

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
        <AppText variant="title">Novo hábito</AppText>

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

        {frequency === "weekly" ? (
          <Controller
            control={form.control}
            name="dayOfWeek"
            render={({ field }) => (
              <SegmentedControl options={DAY_OF_WEEK_OPTIONS} value={field.value ?? "0"} onChange={field.onChange} />
            )}
          />
        ) : null}

        {frequency === "monthly" ? (
          <Controller
            control={form.control}
            name="dayOfMonth"
            render={({ field }) => (
              <FormField
                label="Dia do mês"
                keyboardType="numeric"
                value={field.value ?? ""}
                onChangeText={field.onChange}
              />
            )}
          />
        ) : null}

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

        <Button label="Criar hábito" onPress={onSubmit} />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

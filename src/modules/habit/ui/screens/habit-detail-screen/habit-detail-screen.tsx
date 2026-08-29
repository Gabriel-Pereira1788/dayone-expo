import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeProvider } from "@shopify/restyle";
import { StatusBar } from "expo-status-bar";
import { focusTheme } from "@/styles";
import { AppText, DashTrack, IconButton, MonoLabel } from "@/shared/ui";
import { FREQUENCY_LABELS, describeHabitContinuity, formatTimeOfDay } from "@/modules/habit/utils";
import type { Habit, HabitFrequency } from "@/modules/habit/domain/types";
import type { Streak } from "@/modules/streak/domain/types";
import type { DashMarkState } from "@/shared/ui";
import { useHabitDetailScreenViewModel } from "./habit-detail-screen.viewmodel";
import { useHabitDetailScreenStyles } from "./habit-detail-screen.styles";

interface HabitDetailContentProps {
  habit: Habit;
  streaks: Streak[];
  dashMarks: DashMarkState[];
  missedCount: number;
  checkedToday: boolean;
  toggleCheck: () => void;
  editHabit: () => void;
  removeHabit: () => void;
  goBack: () => void;
}

// `useHabitDetailScreenStyles` reads `useTheme()`, so it must run in a
// component that's a *descendant* of `<ThemeProvider theme={focusTheme}>` —
// calling it in the same component that renders the provider would still
// resolve the outer (light) theme, since a provider only affects its
// children's context, not its own render.
function HabitDetailContent({
  habit,
  streaks,
  dashMarks,
  missedCount,
  checkedToday,
  toggleCheck,
  editHabit,
  removeHabit,
  goBack,
}: HabitDetailContentProps) {
  const styles = useHabitDetailScreenStyles();

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <View style={styles.topRow}>
        <Pressable onPress={goBack} hitSlop={12}>
          <MonoLabel tone="muted">← VOLTAR</MonoLabel>
        </Pressable>
        <MonoLabel tone="muted">{FREQUENCY_LABELS[habit.frequency as HabitFrequency]}</MonoLabel>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <AppText variant="serifDisplay" tone="primary">
            {habit.icon ? `${habit.icon}  ${habit.title}` : habit.title}
          </AppText>
          {habit.description ? (
            <AppText variant="body" tone="muted">
              {habit.description}
            </AppText>
          ) : null}

          <View style={styles.dashRow}>
            <DashTrack marks={dashMarks} />
          </View>
          <MonoLabel tone="faint">{describeHabitContinuity(missedCount, dashMarks.length, false)}</MonoLabel>
        </View>

        <View style={styles.actionsRow}>
          <IconButton
            icon={checkedToday ? "uncheck" : "check"}
            label={checkedToday ? "DESMARCAR" : "MARCAR"}
            onPress={toggleCheck}
          />
          <IconButton icon="edit" label="EDITAR" onPress={editHabit} />
          <IconButton icon="delete" label="EXCLUIR" tone="danger" onPress={removeHabit} />
        </View>

        <View style={styles.historySection}>
          <MonoLabel tone="faint">HISTÓRICO</MonoLabel>
          {streaks.length === 0 ? (
            <AppText variant="body" tone="muted">
              Nenhum check-in ainda.
            </AppText>
          ) : (
            <View style={styles.historyList}>
              {streaks.map((streak) => (
                <View key={streak.id} style={styles.historyRow}>
                  <MonoLabel tone="muted" uppercase={false}>
                    {new Date(streak.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                  </MonoLabel>
                  <MonoLabel tone="faint">{formatTimeOfDay(streak.createdAt)}</MonoLabel>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function HabitDetailScreen() {
  const {
    habit,
    streaks,
    dashMarks,
    missedCount,
    checkedToday,
    toggleCheck,
    removeHabit,
    editHabit,
    goBack,
  } = useHabitDetailScreenViewModel();

  if (!habit) {
    return null;
  }
  return (
    <ThemeProvider theme={focusTheme}>
      <StatusBar style="light" />
      <HabitDetailContent
        habit={habit}
        streaks={streaks}
        dashMarks={dashMarks}
        missedCount={missedCount}
        checkedToday={checkedToday}
        toggleCheck={toggleCheck}
        editHabit={editHabit}
        removeHabit={removeHabit}
        goBack={goBack}
      />
    </ThemeProvider>
  );
}

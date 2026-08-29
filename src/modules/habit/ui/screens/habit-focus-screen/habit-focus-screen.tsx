import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeProvider } from "@shopify/restyle";
import { StatusBar } from "expo-status-bar";
import { focusTheme } from "@/styles";
import { FocusPrompt } from "@/modules/habit/ui/components/focus-prompt";
import type { Habit } from "@/modules/habit/domain/types";
import type { DashMarkState } from "@/shared/ui";
import { useHabitFocusScreenViewModel } from "./habit-focus-screen.viewmodel";
import { useHabitFocusScreenStyles } from "./habit-focus-screen.styles";

interface HabitFocusContentProps {
  currentHabit: Habit | null;
  dashMarks: DashMarkState[];
  missedCount: number;
  remainingLabel: string;
  streakNumber: number;
  progressIndex: number;
  progressTotal: number;
  completeCurrent: () => void;
  undoCurrent: () => void;
  advance: () => void;
}

// `useHabitFocusScreenStyles` reads `useTheme()`, so it must run inside a
// descendant of `<ThemeProvider theme={focusTheme}>` — see the identical
// note in `habit-detail-screen.tsx`.
function HabitFocusContent({
  currentHabit,
  dashMarks,
  missedCount,
  remainingLabel,
  streakNumber,
  progressIndex,
  progressTotal,
  completeCurrent,
  undoCurrent,
  advance,
}: HabitFocusContentProps) {
  const styles = useHabitFocusScreenStyles();

  if (!currentHabit) {
    return <View style={styles.root} />;
  }

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <FocusPrompt
        key={currentHabit.id}
        remainingLabel={remainingLabel}
        streakNumber={streakNumber}
        title={currentHabit.title}
        dashMarks={dashMarks}
        missedCount={missedCount}
        progressIndex={progressIndex}
        progressTotal={progressTotal}
        onSwipeComplete={completeCurrent}
        onUndo={undoCurrent}
        onAdvance={advance}
      />
    </SafeAreaView>
  );
}

export function HabitFocusScreen() {
  const {
    isReady,
    currentHabit,
    dashMarks,
    missedCount,
    remainingLabel,
    streakNumber,
    progressIndex,
    progressTotal,
    completeCurrent,
    undoCurrent,
    advance,
  } = useHabitFocusScreenViewModel();

  return (
    <ThemeProvider theme={focusTheme}>
      <StatusBar style="light" />
      <HabitFocusContent
        currentHabit={isReady ? currentHabit : null}
        dashMarks={dashMarks}
        missedCount={missedCount}
        remainingLabel={remainingLabel}
        streakNumber={streakNumber}
        progressIndex={progressIndex}
        progressTotal={progressTotal}
        completeCurrent={completeCurrent}
        undoCurrent={undoCurrent}
        advance={advance}
      />
    </ThemeProvider>
  );
}

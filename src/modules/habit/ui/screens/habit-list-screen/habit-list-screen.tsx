import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeProvider } from "@shopify/restyle";
import { StatusBar } from "expo-status-bar";
import { focusTheme } from "@/styles";
import { MonoLabel } from "@/shared/ui";
import { LedgerHeader } from "@/modules/habit/ui/components/ledger-header";
import { HabitLedgerRow } from "@/modules/habit/ui/components/habit-ledger-row";
import { ContinuityFooter } from "@/modules/habit/ui/components/continuity-footer";
import { ClosedDayLedger } from "@/modules/habit/ui/components/closed-day-ledger";
import { useHabitListScreenViewModel } from "./habit-list-screen.viewmodel";
import { useHabitListScreenStyles } from "./habit-list-screen.styles";

export function HabitListScreen() {
  const {
    isLoading,
    headerLabel,
    rows,
    dayIsClosed,
    stats,
    segments,
    lastBreakLabel,
    closedDay,
    openHabit,
    openNewHabit,
    openProfile,
  } = useHabitListScreenViewModel();
  const styles = useHabitListScreenStyles();

  if (isLoading) {
    return <View style={styles.root} />;
  }

  if (dayIsClosed) {
    return (
      <ThemeProvider theme={focusTheme}>
        <StatusBar style="light" />
        <ClosedDayLedger
          dateLabel={closedDay.dateLabel}
          headline={closedDay.headline}
          rows={closedDay.rows}
          streakCount={stats.current}
          best={stats.best}
          segments={segments}
          onNewHabit={openNewHabit}
          onOpenProfile={openProfile}
          onOpenHabit={(habitId) => openHabit(habitId, "done")}
        />
      </ThemeProvider>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <LedgerHeader label={headerLabel} onNewHabit={openNewHabit} onOpenProfile={openProfile} />

      {rows.length === 0 ? (
        <View style={styles.emptyState}>
          <MonoLabel tone="faint">NENHUM HÁBITO PARA HOJE</MonoLabel>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {rows.map((row) => (
            <HabitLedgerRow
              key={row.habitId}
              title={row.title}
              icon={row.icon}
              status={row.status}
              metaLabel={row.metaLabel}
              onPress={() => openHabit(row.habitId, row.status)}
            />
          ))}
        </ScrollView>
      )}

      <ContinuityFooter
        current={stats.current}
        best={stats.best}
        lastBreakLabel={lastBreakLabel}
        segments={segments}
      />
    </SafeAreaView>
  );
}

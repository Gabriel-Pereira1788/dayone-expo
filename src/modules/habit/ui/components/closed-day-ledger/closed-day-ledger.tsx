import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActionIcon, AppText, ContinuityTrack, MonoLabel, type ContinuitySegment } from "@/shared/ui";
import { useClosedDayLedgerStyles } from "./closed-day-ledger.styles";

export interface ClosedDayRow {
  habitId: string;
  title: string;
  time: string;
}

export interface ClosedDayLedgerProps {
  dateLabel: string;
  headline: string;
  rows: ClosedDayRow[];
  streakCount: number;
  best: number;
  segments: ContinuitySegment[];
  onNewHabit: () => void;
  onOpenHabit: (habitId: string) => void;
  onOpenProfile: () => void;
}

/**
 * The dark "day closed" recap (design/ 3c): once the ledger's open rows run
 * out, the empty stack becomes the record of the day — every habit and the
 * time it landed, anchored to the same vertical rule as the light ledger,
 * with tonight's continuity line in white-on-graphite underneath.
 */
export function ClosedDayLedger({
  dateLabel,
  headline,
  rows,
  streakCount,
  best,
  segments,
  onNewHabit,
  onOpenHabit,
  onOpenProfile,
}: ClosedDayLedgerProps) {
  const styles = useClosedDayLedgerStyles();

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <View style={styles.topRow}>
        <MonoLabel tone="muted">{`${dateLabel} · CLOSED`}</MonoLabel>
        <View style={styles.topRowRight}>
          <MonoLabel tone="muted">{streakCount}</MonoLabel>
          <Pressable onPress={onOpenProfile} hitSlop={12} accessibilityLabel="Perfil">
            <ActionIcon name="profile" color={styles.iconColor} size={18} />
          </Pressable>
          <Pressable onPress={onNewHabit} hitSlop={12} accessibilityLabel="Novo hábito">
            <AppText variant="title" tone="primary">
              +
            </AppText>
          </Pressable>
        </View>
      </View>

      <View style={styles.body}>
        <AppText variant="serifDisplay" tone="primary">
          {headline}
        </AppText>

        <View style={styles.list}>
          <View style={styles.rule} />
          <View style={styles.rows}>
            {rows.map((row) => (
              <Pressable key={row.habitId} style={styles.row} onPress={() => onOpenHabit(row.habitId)}>
                <AppText variant="body" tone="muted">
                  {row.title}
                </AppText>
                <MonoLabel tone="faint">{row.time}</MonoLabel>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <ContinuityTrack segments={segments} />
        <View style={styles.footerCaption}>
          <MonoLabel tone="faint">{`${streakCount} UNBROKEN · BEST ${best}`}</MonoLabel>
          <MonoLabel tone="faint">SWIPE DOWN ↓</MonoLabel>
        </View>
      </View>
    </SafeAreaView>
  );
}

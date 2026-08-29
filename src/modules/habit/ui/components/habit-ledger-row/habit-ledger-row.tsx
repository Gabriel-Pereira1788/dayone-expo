import { Pressable, View } from "react-native";
import { AppText, MonoLabel } from "@/shared/ui";
import { useHabitLedgerRowStyles } from "./habit-ledger-row.styles";

export interface HabitLedgerRowProps {
  title: string;
  icon?: string;
  status: "done" | "open";
  metaLabel: string;
  onPress: () => void;
}

/**
 * One row of the ledger's typographic record (design/ 1a): the habit name
 * in Instrument Sans, a mono meta line underneath ("DONE 07:14 · 42" /
 * "OPEN · 6"), both dimmed while the habit is still open for the day.
 */
export function HabitLedgerRow({ title, icon, status, metaLabel, onPress }: HabitLedgerRowProps) {
  const styles = useHabitLedgerRowStyles();
  const isOpen = status === "open";

  return (
    <Pressable onPress={onPress} style={styles.root}>
      <View style={styles.stack}>
        <AppText variant="bodyMedium" tone={isOpen ? "faint" : "primary"}>
          {icon ? `${icon}  ${title}` : title}
        </AppText>
        <MonoLabel tone={isOpen ? "fainter" : "muted"}>{metaLabel}</MonoLabel>
      </View>
    </Pressable>
  );
}

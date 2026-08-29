import { Pressable, View } from "react-native";
import { ActionIcon, AppText, MonoLabel } from "@/shared/ui";
import { useLedgerHeaderStyles } from "./ledger-header.styles";

export interface LedgerHeaderProps {
  label: string;
  onNewHabit: () => void;
  onOpenProfile: () => void;
}

/**
 * The ledger's top bar (design/ 1a: "THU 27 AUG · WEEK 35"), plus the two
 * pieces of chrome the mockups don't need but the app does: opening the
 * profile and adding a habit.
 */
export function LedgerHeader({ label, onNewHabit, onOpenProfile }: LedgerHeaderProps) {
  const styles = useLedgerHeaderStyles();

  return (
    <View style={styles.root}>
      <MonoLabel tone="muted">{label}</MonoLabel>
      <View style={styles.actions}>
        <Pressable onPress={onOpenProfile} hitSlop={12} accessibilityLabel="Perfil">
          <ActionIcon name="profile" color={styles.iconColor} size={18} />
        </Pressable>
        <Pressable onPress={onNewHabit} hitSlop={12} accessibilityLabel="Novo hábito">
          <AppText variant="title" tone="muted">
            +
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

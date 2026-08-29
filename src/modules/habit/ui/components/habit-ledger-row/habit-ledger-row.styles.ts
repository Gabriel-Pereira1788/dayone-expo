import { StyleSheet } from "react-native";
import { useTheme } from "@shopify/restyle";
import type { Theme } from "@/styles";

export function useHabitLedgerRowStyles() {
  const theme = useTheme<Theme>();

  return StyleSheet.create({
    root: {
      paddingVertical: theme.spacing.sp6,
    },
    stack: {
      gap: theme.spacing.sp5,
    },
  });
}

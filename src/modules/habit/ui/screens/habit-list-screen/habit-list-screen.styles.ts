import { StyleSheet } from "react-native";
import { useTheme } from "@shopify/restyle";
import type { Theme } from "@/styles";

export function useHabitListScreenStyles() {
  const theme = useTheme<Theme>();

  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.colors.pageBackground,
    },
    list: {
      paddingHorizontal: theme.spacing.sp24,
      paddingTop: theme.spacing.sp34,
      gap: theme.spacing.sp26,
    },
    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: theme.spacing.sp48,
    },
  });
}

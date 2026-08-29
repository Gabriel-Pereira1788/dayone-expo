import { StyleSheet } from "react-native";
import { useTheme } from "@shopify/restyle";
import type { Theme } from "@/styles";

export function useHabitDetailScreenStyles() {
  const theme = useTheme<Theme>();

  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.colors.pageBackground,
    },
    topRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.sp24,
      paddingTop: theme.spacing.sp16,
      paddingBottom: theme.spacing.sp8,
    },
    content: {
      paddingHorizontal: theme.spacing.sp34,
      paddingTop: theme.spacing.sp30,
      paddingBottom: theme.spacing.sp34,
      gap: theme.spacing.sp36,
    },
    hero: {
      gap: theme.spacing.sp10,
    },
    dashRow: {
      marginTop: theme.spacing.sp20,
    },
    actionsRow: {
      flexDirection: "row",
      justifyContent: "space-around",
    },
    historySection: {
      gap: theme.spacing.sp14,
    },
    historyList: {
      gap: theme.spacing.sp10,
    },
    historyRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingBottom: theme.spacing.sp8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.hairline,
    },
  });
}

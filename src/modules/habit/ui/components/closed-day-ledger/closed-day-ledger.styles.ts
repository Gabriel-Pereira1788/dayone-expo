import { StyleSheet } from "react-native";
import { useTheme } from "@shopify/restyle";
import type { Theme } from "@/styles";

export function useClosedDayLedgerStyles() {
  const theme = useTheme<Theme>();

  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.colors.pageBackground,
      paddingTop: theme.spacing.sp26,
      paddingBottom: theme.spacing.sp34,
    },
    topRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: theme.spacing.sp24,
    },
    topRowRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sp16,
    },
    body: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: theme.spacing.sp34,
      gap: theme.spacing.sp36,
    },
    list: {
      flexDirection: "row",
      gap: theme.spacing.sp18,
    },
    rule: {
      width: 2,
      backgroundColor: theme.colors.doneIdle,
    },
    rows: {
      flex: 1,
      gap: theme.spacing.sp22,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
    },
    footer: {
      paddingHorizontal: theme.spacing.sp34,
      gap: theme.spacing.sp10,
    },
    footerCaption: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
  });

  return { ...styles, iconColor: theme.colors.inkMuted };
}

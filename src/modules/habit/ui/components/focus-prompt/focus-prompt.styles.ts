import { StyleSheet } from "react-native";
import { useTheme } from "@shopify/restyle";
import type { Theme } from "@/styles";

export function useFocusPromptStyles() {
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
      paddingTop: theme.spacing.sp26,
    },
    center: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: theme.spacing.sp34,
      gap: theme.spacing.sp2,
    },
    dashRow: {
      marginTop: theme.spacing.sp30,
    },
    bottomAffordance: {
      position: "absolute",
      left: theme.spacing.sp34,
      right: theme.spacing.sp34,
      bottom: theme.spacing.sp56,
      alignItems: "center",
      gap: theme.spacing.sp12,
    },
    swipeCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: theme.colors.ruleInactive,
      alignItems: "center",
      justifyContent: "center",
    },
    swipeDash: {
      width: 14,
      height: 1,
      backgroundColor: theme.colors.inkMuted,
    },
    undoCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: theme.colors.ruleInactive,
      alignItems: "center",
      justifyContent: "center",
    },
    undoDash: {
      width: 14,
      height: 1,
      backgroundColor: theme.colors.inkMuted,
    },
    progressDots: {
      position: "absolute",
      left: theme.spacing.sp34,
      right: theme.spacing.sp34,
      bottom: theme.spacing.sp22,
      flexDirection: "row",
      justifyContent: "center",
      gap: theme.spacing.sp5,
    },
    dot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: theme.colors.ruleInactive,
    },
    dotActive: {
      backgroundColor: theme.colors.inkPrimary,
    },
  });
}

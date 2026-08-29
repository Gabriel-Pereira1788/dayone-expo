import { StyleSheet } from "react-native";
import { useTheme } from "@shopify/restyle";
import type { Theme } from "@/styles";

export function useContinuityTrackStyles({ thickness }: { thickness: number }) {
  const theme = useTheme<Theme>();

  return StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      height: thickness,
    },
    segment: {
      height: thickness,
      minWidth: 3,
    },
    gapBefore: {
      marginLeft: theme.spacing.sp4,
    },
    active: {
      backgroundColor: theme.colors.ruleActive,
    },
    inactive: {
      backgroundColor: theme.colors.ruleInactive,
    },
  });
}

import { StyleSheet } from "react-native";
import { useTheme } from "@shopify/restyle";
import type { Theme } from "@/styles";

export function useDashTrackStyles({
  markWidth,
  thickness,
  gap,
}: {
  markWidth: number;
  thickness: number;
  gap: number;
}) {
  const theme = useTheme<Theme>();

  return StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap,
    },
    mark: {
      width: markWidth,
      height: thickness,
      borderRadius: thickness / 2,
    },
    done: {
      backgroundColor: theme.colors.doneIdle,
    },
    gap: {
      backgroundColor: theme.colors.gapSlot,
    },
    active: {
      height: thickness + 1,
      backgroundColor: theme.colors.ruleActive,
      shadowColor: theme.colors.ruleGlow,
      shadowOpacity: 1,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 0 },
    },
  });
}

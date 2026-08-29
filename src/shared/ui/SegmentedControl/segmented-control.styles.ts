import { StyleSheet } from "react-native";
import { useTheme } from "@shopify/restyle";
import type { Theme } from "@/styles";

export function useSegmentedControlStyles() {
  const theme = useTheme<Theme>();

  return StyleSheet.create({
    row: {
      flexDirection: "row",
      gap: theme.spacing.sp8,
    },
    segment: {
      flex: 1,
      alignItems: "center",
      paddingVertical: theme.spacing.sp10,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.hairline,
    },
    segmentActive: {
      borderBottomColor: theme.colors.ruleActive,
      borderBottomWidth: 2,
    },
  });
}

import { StyleSheet } from "react-native";
import { useTheme } from "@shopify/restyle";
import type { Theme } from "@/styles";

export function useHabitFocusScreenStyles() {
  const theme = useTheme<Theme>();

  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.colors.pageBackground,
    },
  });
}

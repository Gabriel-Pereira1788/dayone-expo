import { StyleSheet } from "react-native";
import { useTheme } from "@shopify/restyle";
import type { Theme } from "@/styles";

export function useEditHabitScreenStyles() {
  const theme = useTheme<Theme>();

  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.colors.pageBackground,
    },
    cancelRow: {
      paddingHorizontal: theme.spacing.sp24,
      paddingTop: theme.spacing.sp16,
      alignSelf: "flex-start",
    },
    content: {
      padding: theme.spacing.sp24,
      gap: theme.spacing.sp20,
    },
    row: {
      flexDirection: "row",
      gap: theme.spacing.sp16,
    },
    rowItem: {
      flex: 1,
    },
  });
}

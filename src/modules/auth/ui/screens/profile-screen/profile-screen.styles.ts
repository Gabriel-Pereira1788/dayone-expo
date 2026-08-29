import { StyleSheet } from "react-native";
import { useTheme } from "@shopify/restyle";
import type { Theme } from "@/styles";

export function useProfileScreenStyles() {
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
      flex: 1,
      padding: theme.spacing.sp24,
      justifyContent: "center",
      gap: theme.spacing.sp24,
    },
    userInfo: {
      gap: theme.spacing.sp4,
    },
  });
}

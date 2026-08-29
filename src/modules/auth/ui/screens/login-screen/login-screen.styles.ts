import { StyleSheet } from "react-native";
import { useTheme } from "@shopify/restyle";
import type { Theme } from "@/styles";

export function useLoginScreenStyles() {
  const theme = useTheme<Theme>();

  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.colors.pageBackground,
    },
    content: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: theme.spacing.sp24,
      gap: theme.spacing.sp20,
    },
    link: {
      alignSelf: "center",
      marginTop: theme.spacing.sp8,
    },
  });
}

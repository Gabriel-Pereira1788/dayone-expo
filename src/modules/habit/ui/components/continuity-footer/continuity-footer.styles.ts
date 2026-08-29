import { StyleSheet } from "react-native";
import { useTheme } from "@shopify/restyle";
import type { Theme } from "@/styles";

export function useContinuityFooterStyles() {
  const theme = useTheme<Theme>();

  return StyleSheet.create({
    root: {
      paddingHorizontal: theme.spacing.sp24,
      paddingTop: theme.spacing.sp16,
      paddingBottom: theme.spacing.sp34,
      borderTopWidth: 1,
      borderTopColor: theme.colors.hairline,
      gap: theme.spacing.sp10,
    },
    headline: {
      gap: theme.spacing.sp6,
    },
    track: {
      marginTop: theme.spacing.sp4,
    },
  });
}

import { StyleSheet } from "react-native";
import { useTheme } from "@shopify/restyle";
import type { Theme } from "@/styles";

export function useLedgerHeaderStyles() {
  const theme = useTheme<Theme>();

  const styles = StyleSheet.create({
    root: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.sp24,
      paddingTop: theme.spacing.sp26,
    },
    actions: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sp16,
    },
  });

  return { ...styles, iconColor: theme.colors.inkMuted };
}

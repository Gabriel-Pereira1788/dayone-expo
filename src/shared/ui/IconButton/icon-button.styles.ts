import { StyleSheet } from "react-native";
import { useTheme } from "@shopify/restyle";
import type { Theme } from "@/styles";

export function useIconButtonStyles({ tone }: { tone: "default" | "danger" }) {
  const theme = useTheme<Theme>();
  const iconColor = tone === "danger" ? theme.colors.feedbackError : theme.colors.inkPrimary;

  const styles = StyleSheet.create({
    root: {
      alignItems: "center",
      gap: theme.spacing.sp8,
    },
    circle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: tone === "danger" ? theme.colors.feedbackError : theme.colors.ruleInactive,
      alignItems: "center",
      justifyContent: "center",
    },
  });

  return { ...styles, iconColor };
}

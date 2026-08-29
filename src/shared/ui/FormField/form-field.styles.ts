import { StyleSheet } from "react-native";
import { useTheme } from "@shopify/restyle";
import type { Theme } from "@/styles";
import { FONT_FAMILY } from "@/styles/fonts";

export function useFormFieldStyles({ hasError }: { hasError: boolean }) {
  const theme = useTheme<Theme>();

  const styles = StyleSheet.create({
    root: {
      gap: theme.spacing.sp6,
    },
    input: {
      fontFamily: FONT_FAMILY.sans,
      fontSize: 16,
      color: theme.colors.inkPrimary,
      paddingVertical: theme.spacing.sp8,
      borderBottomWidth: 1,
      borderBottomColor: hasError ? theme.colors.feedbackError : theme.colors.hairline,
    },
  });

  return { ...styles, placeholderColor: theme.colors.inkFainter };
}

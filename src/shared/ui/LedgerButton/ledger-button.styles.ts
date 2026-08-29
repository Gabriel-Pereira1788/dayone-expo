import { StyleSheet } from "react-native";
import { useTheme } from "@shopify/restyle";
import type { Theme } from "@/styles";
import { FONT_FAMILY } from "@/styles/fonts";
import type { LedgerButtonVariant } from "./ledger-button";

export function useLedgerButtonStyles({ variant, disabled }: { variant: LedgerButtonVariant; disabled: boolean }) {
  const theme = useTheme<Theme>();

  return StyleSheet.create({
    root: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: theme.spacing.sp14,
      borderRadius: theme.borderRadii.rd8,
      backgroundColor: variant === "primary" ? theme.colors.buttonPrimaryBackground : "transparent",
      borderWidth: variant === "primary" ? 0 : 1,
      borderColor: variant === "danger" ? theme.colors.feedbackError : theme.colors.hairline,
      opacity: disabled ? 0.5 : 1,
    },
    primaryLabel: {
      fontFamily: FONT_FAMILY.sansMedium,
      fontSize: 16,
      color: theme.colors.buttonPrimaryText,
    },
  });
}

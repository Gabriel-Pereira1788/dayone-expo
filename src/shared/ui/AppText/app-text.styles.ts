import { StyleSheet, type TextStyle } from "react-native";
import { useTheme } from "@shopify/restyle";
import type { Theme } from "@/styles";
import { FONT_FAMILY } from "@/styles/fonts";
import type { AppTextTone, AppTextVariant } from "./app-text";

const variantStyle: Record<AppTextVariant, TextStyle> = {
  body: { fontFamily: FONT_FAMILY.sans, fontSize: 15, lineHeight: 20 },
  bodyMedium: { fontFamily: FONT_FAMILY.sansMedium, fontSize: 19, lineHeight: 23 },
  title: { fontFamily: FONT_FAMILY.sansSemiBold, fontSize: 22, lineHeight: 27 },
  serifDisplay: { fontFamily: FONT_FAMILY.serif, fontSize: 46, lineHeight: 48, letterSpacing: -0.5 },
  serifDisplayItalic: { fontFamily: FONT_FAMILY.serifItalic, fontSize: 46, lineHeight: 48, letterSpacing: -0.5 },
};

export function useAppTextStyles({ variant, tone }: { variant: AppTextVariant; tone: AppTextTone }) {
  const theme = useTheme<Theme>();

  const colorByTone: Record<AppTextTone, string> = {
    primary: theme.colors.inkPrimary,
    muted: theme.colors.inkMuted,
    faint: theme.colors.inkFaint,
    fainter: theme.colors.inkFainter,
    error: theme.colors.feedbackError,
  };

  return StyleSheet.create({
    text: {
      ...variantStyle[variant],
      color: colorByTone[tone],
    },
  });
}

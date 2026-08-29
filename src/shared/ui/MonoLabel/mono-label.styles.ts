import { StyleSheet } from "react-native";
import { useTheme } from "@shopify/restyle";
import type { Theme } from "@/styles";
import { FONT_FAMILY } from "@/styles/fonts";
import type { MonoLabelTone } from "./mono-label";

export function useMonoLabelStyles({
  tone,
  size,
  weight,
}: {
  tone: MonoLabelTone;
  size: number;
  weight: "regular" | "medium";
}) {
  const theme = useTheme<Theme>();

  const colorByTone: Record<MonoLabelTone, string> = {
    primary: theme.colors.inkPrimary,
    muted: theme.colors.inkMuted,
    faint: theme.colors.inkFaint,
    fainter: theme.colors.inkFainter,
    accent: theme.colors.ruleActive,
    error: theme.colors.feedbackError,
  };

  return StyleSheet.create({
    text: {
      fontFamily: weight === "medium" ? FONT_FAMILY.monoMedium : FONT_FAMILY.mono,
      fontSize: size,
      letterSpacing: size >= 24 ? size * -0.03 : size * 0.12,
      color: colorByTone[tone],
    },
  });
}

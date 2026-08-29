import { StyleSheet } from "react-native";
import { useTheme } from "@shopify/restyle";
import type { Theme } from "@/styles";
import type { RuleProps } from "./rule";

export function useRuleStyles({
  orientation,
  length,
  thickness,
  progress,
}: Required<Pick<RuleProps, "orientation" | "length" | "thickness" | "progress">>) {
  const theme = useTheme<Theme>();
  const isVertical = orientation === "vertical";
  const filledLength = length * progress;

  return StyleSheet.create({
    track: {
      width: isVertical ? thickness : length,
      height: isVertical ? length : thickness,
      backgroundColor: progress === 0 ? theme.colors.hairline : theme.colors.ruleInactive,
    },
    fill: {
      position: "absolute",
      top: 0,
      left: 0,
      width: isVertical ? thickness : filledLength,
      height: isVertical ? filledLength : thickness,
      backgroundColor: theme.colors.ruleActive,
    },
  });
}

import { Text, type TextProps } from "react-native";
import { useMonoLabelStyles } from "./mono-label.styles";

export type MonoLabelTone = "primary" | "muted" | "faint" | "fainter" | "accent" | "error";

export interface MonoLabelProps extends Omit<TextProps, "style"> {
  children: string | number;
  tone?: MonoLabelTone;
  size?: number;
  weight?: "regular" | "medium";
  uppercase?: boolean;
}

/**
 * Tracked-out monospace caption used for every numeral, timestamp, and
 * label in the ledger/focus design system ("THU 27 AUG", "UNBROKEN", "42").
 */
export function MonoLabel({
  children,
  tone = "muted",
  size = 9.5,
  weight = "regular",
  uppercase = true,
  ...textProps
}: MonoLabelProps) {
  const styles = useMonoLabelStyles({ tone, size, weight });

  return (
    <Text {...textProps} style={styles.text}>
      {uppercase && typeof children === "string" ? children.toUpperCase() : children}
    </Text>
  );
}

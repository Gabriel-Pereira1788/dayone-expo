import { Text, type TextProps } from "react-native";
import { useAppTextStyles } from "./app-text.styles";

export type AppTextVariant = "body" | "bodyMedium" | "title" | "serifDisplay" | "serifDisplayItalic";
export type AppTextTone = "primary" | "muted" | "faint" | "fainter" | "error";

export interface AppTextProps extends Omit<TextProps, "style"> {
  variant?: AppTextVariant;
  tone?: AppTextTone;
}

/**
 * Themed sans/serif text primitive for the ledger/focus design system.
 * `body`/`bodyMedium`/`title` use Instrument Sans (habit names, headings);
 * `serifDisplay*` uses Instrument Serif for the single large "now" prompt
 * in the focus flow (design/ 1d).
 */
export function AppText({ variant = "body", tone = "primary", children, ...textProps }: AppTextProps) {
  const styles = useAppTextStyles({ variant, tone });

  return (
    <Text {...textProps} style={styles.text}>
      {children}
    </Text>
  );
}

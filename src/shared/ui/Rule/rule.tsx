import { View } from "react-native";
import { useRuleStyles } from "./rule.styles";

export interface RuleProps {
  orientation: "horizontal" | "vertical";
  /** Length along the main axis (width for horizontal, height for vertical), in px. */
  length: number;
  /** Fraction (0..1) filled with the active accent color, from the start of the main axis. */
  progress?: number;
  thickness?: number;
}

/**
 * The ledger's core continuity metaphor: a single track that's mostly inert
 * (`ruleInactive`/`hairline`) with the completed portion drawn in the
 * theme's accent color (`ruleActive` — amber on paper, purple at night).
 * Used both as a plain 1px hairline divider (`progress={0}`) and as the
 * vertical "today" rule beside the habit list (design/ 1a).
 */
export function Rule({ orientation, length, progress = 0, thickness = 1 }: RuleProps) {
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const styles = useRuleStyles({ orientation, length, thickness, progress: clampedProgress });

  return (
    <View style={styles.track}>
      <View style={styles.fill} />
    </View>
  );
}

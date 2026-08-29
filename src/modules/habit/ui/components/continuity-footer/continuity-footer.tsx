import { View } from "react-native";
import { ContinuityTrack, MonoLabel, type ContinuitySegment } from "@/shared/ui";
import { useContinuityFooterStyles } from "./continuity-footer.styles";

export interface ContinuityFooterProps {
  current: number;
  best: number;
  lastBreakLabel: string;
  segments: ContinuitySegment[];
}

/**
 * The ledger's footer (design/ 2a — option "Falha"): the day's own rule laid
 * flat, showing every historical run and gap, with the current streak
 * number above it and the last break / personal record below.
 */
export function ContinuityFooter({ current, best, lastBreakLabel, segments }: ContinuityFooterProps) {
  const styles = useContinuityFooterStyles();

  return (
    <View style={styles.root}>
      <View style={styles.headline}>
        <MonoLabel tone="faint">SEM QUEBRAR</MonoLabel>
        <MonoLabel size={44} tone="primary">
          {current}
        </MonoLabel>
      </View>
      <View style={styles.track}>
        <ContinuityTrack segments={segments} />
      </View>
      <MonoLabel size={9} tone="faint">{`ÚLTIMA QUEBRA ${lastBreakLabel} · RECORDE ${best}`}</MonoLabel>
    </View>
  );
}

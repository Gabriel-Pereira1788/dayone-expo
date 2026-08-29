import { View } from "react-native";
import { useContinuityTrackStyles } from "./continuity-track.styles";

export interface ContinuitySegment {
  length: number;
  active: boolean;
}

export interface ContinuityTrackProps {
  segments: ContinuitySegment[];
  thickness?: number;
}

/**
 * The footer continuity rule (design/ 2a): the same accent/inactive track as
 * `Rule`, laid flat, with every historical run and gap rendered proportional
 * to how many days it lasted — "the tela shows the trace of the day, the
 * footer shows the trace of the life."
 */
export function ContinuityTrack({ segments, thickness = 2 }: ContinuityTrackProps) {
  const styles = useContinuityTrackStyles({ thickness });
  const totalDays = segments.reduce((sum, segment) => sum + segment.length, 0) || 1;

  return (
    <View style={styles.row}>
      {segments.map((segment, index) => (
        <View
          key={index}
          style={[
            styles.segment,
            {
              flexGrow: segment.length / totalDays,
              backgroundColor: segment.active ? styles.active.backgroundColor : styles.inactive.backgroundColor,
            },
            index > 0 && styles.gapBefore,
          ]}
        />
      ))}
    </View>
  );
}

import { View } from "react-native";
import { useDashTrackStyles } from "./dash-track.styles";

export type DashMarkState = "done" | "gap" | "active";

export interface DashTrackProps {
  marks: DashMarkState[];
  markWidth?: number;
  thickness?: number;
  gap?: number;
}

/**
 * The short run of recent-day dashes under a habit's name in the focus flow
 * (design/ 1d, 3a): mostly a steady row of `done` marks, honestly including
 * a dimmer `gap` for a missed day, with the day just completed picked out
 * as a thicker, glowing `active` mark.
 */
export function DashTrack({ marks, markWidth = 20, thickness = 2, gap = 4 }: DashTrackProps) {
  const styles = useDashTrackStyles({ markWidth, thickness, gap });

  return (
    <View style={styles.row}>
      {marks.map((state, index) => (
        <View key={index} style={[styles.mark, styles[state]]} />
      ))}
    </View>
  );
}

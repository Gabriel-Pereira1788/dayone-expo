import { Pressable, View } from "react-native";
import { MonoLabel } from "@/shared/ui/MonoLabel";
import { useSegmentedControlStyles } from "./segmented-control.styles";

export interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** A row of mono-labelled options with a single active one — used for frequency pickers. */
export function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  const styles = useSegmentedControlStyles();

  return (
    <View style={styles.row}>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.segment, isActive && styles.segmentActive]}
          >
            <MonoLabel tone={isActive ? "primary" : "faint"}>{option.label}</MonoLabel>
          </Pressable>
        );
      })}
    </View>
  );
}

import { Presets } from "react-native-pulsar";

export function hapticSwipeThreshold() {
  "worklet";
  Presets.System.selection();
}

export function hapticHabitCompleted() {
  "worklet";
  Presets.System.notificationSuccess();
}

export function hapticHabitUnchecked() {
  "worklet";
  Presets.System.impactLight();
}

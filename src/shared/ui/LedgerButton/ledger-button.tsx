import { Pressable, Text, type PressableProps } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { MonoLabel } from "@/shared/ui/MonoLabel";
import { useLedgerButtonStyles } from "./ledger-button.styles";

const PRESS_SCALE = 0.98;
const PRESS_DURATION_MS = 100;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type LedgerButtonVariant = "primary" | "outline" | "danger";

export interface LedgerButtonProps extends Pick<PressableProps, "onPress" | "accessibilityLabel" | "disabled"> {
  label: string;
  variant?: LedgerButtonVariant;
}

/**
 * The one button shape in the ledger design system: solid ink for the
 * primary action, an outlined hairline for secondary actions, and the
 * shared feedback color for destructive ones.
 */
export function LedgerButton({ label, variant = "primary", disabled, ...pressableProps }: LedgerButtonProps) {
  const styles = useLedgerButtonStyles({ variant, disabled: Boolean(disabled) });
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function onPressIn() {
    scale.value = withTiming(PRESS_SCALE, { duration: PRESS_DURATION_MS, easing: Easing.in(Easing.ease) });
  }

  function onPressOut() {
    scale.value = withTiming(1, { duration: PRESS_DURATION_MS, easing: Easing.in(Easing.ease) });
  }

  return (
    <AnimatedPressable
      {...pressableProps}
      disabled={disabled}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[styles.root, animatedStyle]}
    >
      {variant === "primary" ? (
        <Text style={styles.primaryLabel}>{label}</Text>
      ) : (
        <MonoLabel tone={variant === "danger" ? "error" : "muted"}>{label}</MonoLabel>
      )}
    </AnimatedPressable>
  );
}

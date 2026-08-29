import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, Text, View, type PressableProps } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useTheme } from "@shopify/restyle";
import { MonoLabel } from "@/shared/ui/MonoLabel";
import type { Theme } from "@/styles";
import { useButtonStyles } from "./button.styles";

const PRESS_SCALE = 0.98;
const PRESS_DURATION_MS = 100;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type ButtonVariant = "primary" | "outline" | "danger";

export interface ButtonProps extends Pick<PressableProps, "onPress" | "accessibilityLabel" | "disabled"> {
  label: string;
  variant?: ButtonVariant;
  icon?: ReactNode;
  loading?: boolean;
}

/**
 * The one button shape in the ledger design system: solid ink for the
 * primary action, an outlined hairline for secondary actions, and the
 * shared feedback color for destructive ones. An optional leading icon and
 * a loading spinner cover social sign-in and pending-mutation buttons.
 */
export function Button({ label, variant = "primary", icon, loading, disabled, ...pressableProps }: ButtonProps) {
  const theme = useTheme<Theme>();
  const isDisabled = disabled || loading;
  const styles = useButtonStyles({ variant, disabled: Boolean(isDisabled) });
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
      disabled={isDisabled}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[styles.root, animatedStyle]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? theme.colors.buttonPrimaryText : theme.colors.inkPrimary} />
      ) : (
        <View style={styles.content}>
          {icon}
          {variant === "primary" ? (
            <Text style={styles.primaryLabel}>{label}</Text>
          ) : (
            <MonoLabel tone={variant === "danger" ? "error" : "muted"}>{label}</MonoLabel>
          )}
        </View>
      )}
    </AnimatedPressable>
  );
}

import { useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { AppText, DashTrack, MonoLabel, type DashMarkState } from "@/shared/ui";
import { describeHabitContinuity, formatTimeOfDay } from "@/modules/habit/utils";
import { hapticHabitCompleted, hapticHabitUnchecked, hapticSwipeThreshold } from "@/shared/helpers/haptics";
import { useFocusPromptStyles } from "./focus-prompt.styles";

const SWIPE_DISTANCE_THRESHOLD = -70;
const SWIPE_VELOCITY_THRESHOLD = -800;
const SWIPE_CLAMP = -140;
const SWIPE_RUBBER_BAND_FACTOR = 0.35;
const CONFIRM_SPRING = { damping: 16, stiffness: 220 };
const CONFIRM_HOLD_MS = 900;

export interface FocusPromptProps {
  remainingLabel: string;
  streakNumber: number;
  title: string;
  dashMarks: DashMarkState[];
  missedCount: number;
  progressIndex: number;
  progressTotal: number;
  onSwipeComplete: () => void;
  onUndo: () => void;
  onAdvance: () => void;
}

/**
 * The full-bleed, one-habit-at-a-time focus flow (design/ 1d), plus the
 * completion state that follows a swipe-up (design/ 3a): the title recedes,
 * "now" becomes the completion time, a new dash draws in, and the circle
 * affordance becomes a thin undo dash before the flow advances.
 *
 * The pan only claims vertical intent (`activeOffsetY` + `failOffsetX`) so a
 * horizontal touch releases immediately to iOS's edge-swipe-back gesture
 * instead of being eaten by this full-bleed gesture area.
 */
export function FocusPrompt({
  remainingLabel,
  streakNumber,
  title,
  dashMarks,
  missedCount,
  progressIndex,
  progressTotal,
  onSwipeComplete,
  onUndo,
  onAdvance,
}: FocusPromptProps) {
  const styles = useFocusPromptStyles();
  const [phase, setPhase] = useState<"idle" | "confirming">("idle");
  const [completedAt, setCompletedAt] = useState<Date | null>(null);
  const translateY = useSharedValue(0);
  const hasFiredThresholdTick = useSharedValue(false);
  const advanceTimer = useRef<number | null>(null);

  function handleComplete() {
    setCompletedAt(new Date());
    setPhase("confirming");
    onSwipeComplete();
    advanceTimer.current = setTimeout(onAdvance, CONFIRM_HOLD_MS);
  }

  function handleUndo() {
    clearTimeout(advanceTimer.current ?? undefined);
    hapticHabitUnchecked();
    onUndo();
    setPhase("idle");
    setCompletedAt(null);
    translateY.value = withSpring(0);
  }

  const pan = Gesture.Pan()
    .enabled(phase === "idle")
    .activeOffsetY([-10, 10])
    .failOffsetX([-10, 10])
    .onBegin(() => {
      hasFiredThresholdTick.value = false;
    })
    .onUpdate((event) => {
      const raw = event.translationY;
      // Rubber-band past the clamp instead of a hard stop, so the drag keeps
      // giving a little under the finger rather than feeling like a wall.
      translateY.value = raw > SWIPE_CLAMP ? raw : SWIPE_CLAMP + (raw - SWIPE_CLAMP) * SWIPE_RUBBER_BAND_FACTOR;

      // A single tick right as the drag passes the point of no return, not
      // on every frame past it.
      const pastThreshold = raw < SWIPE_DISTANCE_THRESHOLD;
      if (pastThreshold && !hasFiredThresholdTick.value) {
        hasFiredThresholdTick.value = true;
        hapticSwipeThreshold();
      } else if (!pastThreshold && hasFiredThresholdTick.value) {
        hasFiredThresholdTick.value = false;
      }
    })
    .onEnd((event) => {
      const crossedThreshold =
        event.translationY < SWIPE_DISTANCE_THRESHOLD || event.velocityY < SWIPE_VELOCITY_THRESHOLD;
      if (crossedThreshold) {
        translateY.value = withSpring(SWIPE_CLAMP, CONFIRM_SPRING);
        hapticHabitCompleted();
        runOnJS(handleComplete)();
      } else {
        translateY.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    const progress = interpolate(translateY.value, [0, SWIPE_CLAMP], [0, 1], Extrapolation.CLAMP);
    return {
      opacity: interpolate(progress, [0, 1], [1, 0.55], Extrapolation.CLAMP),
      transform: [
        { translateY: translateY.value },
        { scale: interpolate(progress, [0, 1], [1, 0.96], Extrapolation.CLAMP) },
      ],
    };
  });

  const isConfirming = phase === "confirming";
  const displayMarks: DashMarkState[] = isConfirming ? [...dashMarks, "active"] : dashMarks;

  return (
    <View style={styles.root}>
      <View style={styles.topRow}>
        <MonoLabel tone="muted">{remainingLabel}</MonoLabel>
        <MonoLabel tone="muted">{streakNumber}</MonoLabel>
      </View>

      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.center, animatedStyle]}>
          <AppText variant="body" tone={isConfirming ? "faint" : "muted"}>
            {isConfirming && completedAt ? formatTimeOfDay(completedAt.toISOString()) : "now"}
          </AppText>
          <AppText variant="serifDisplay" tone={isConfirming ? "faint" : "primary"}>
            {title}
          </AppText>
          <View style={styles.dashRow}>
            <DashTrack marks={displayMarks} />
          </View>
          <MonoLabel tone="faint">{describeHabitContinuity(missedCount, dashMarks.length, isConfirming)}</MonoLabel>
        </Animated.View>
      </GestureDetector>

      <View style={styles.bottomAffordance}>
        {isConfirming ? (
          <Pressable onPress={handleUndo} hitSlop={16} style={styles.undoCircle}>
            <View style={styles.undoDash} />
          </Pressable>
        ) : (
          <>
            <View style={styles.swipeCircle}>
              <View style={styles.swipeDash} />
            </View>
            <MonoLabel tone="muted">SWIPE UP TO COMPLETE</MonoLabel>
          </>
        )}
      </View>

      <View style={styles.progressDots}>
        {Array.from({ length: progressTotal }).map((_, index) => (
          <View key={index} style={[styles.dot, index === progressIndex && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

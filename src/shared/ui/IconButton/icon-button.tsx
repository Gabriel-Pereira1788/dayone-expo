import { Pressable, View } from "react-native";
import { ActionIcon, type ActionIconName } from "@/shared/ui/ActionIcon";
import { MonoLabel } from "@/shared/ui/MonoLabel";
import { useIconButtonStyles } from "./icon-button.styles";

export interface IconButtonProps {
  icon: ActionIconName;
  label: string;
  onPress: () => void;
  tone?: "default" | "danger";
}

/**
 * The circle-and-caption affordance from the focus flow (design/ 1d's swipe
 * button), reused as a tappable action: a thin-stroke icon inside a hairline
 * circle with a small mono label underneath.
 */
export function IconButton({ icon, label, onPress, tone = "default" }: IconButtonProps) {
  const styles = useIconButtonStyles({ tone });

  return (
    <Pressable onPress={onPress} style={styles.root} accessibilityLabel={label}>
      <View style={styles.circle}>
        <ActionIcon name={icon} color={styles.iconColor} size={20} />
      </View>
      <MonoLabel tone={tone === "danger" ? "error" : "faint"}>{label}</MonoLabel>
    </Pressable>
  );
}

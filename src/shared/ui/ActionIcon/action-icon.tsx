import Svg, { Circle, Line, Path } from "react-native-svg";
import { useTheme } from "@shopify/restyle";
import type { Theme } from "@/styles";

export type ActionIconName = "check" | "uncheck" | "edit" | "delete";

export interface ActionIconProps {
  name: ActionIconName;
  color?: string;
  size?: number;
}

/**
 * Minimal single-stroke glyphs matching the ledger/focus design system's own
 * geometry (the same thin circle-and-dash vocabulary as the swipe affordance
 * in `FocusPrompt`) — deliberately not a general-purpose icon font, since
 * none of the mockups use one.
 */
export function ActionIcon({ name, color, size = 20 }: ActionIconProps) {
  const theme = useTheme<Theme>();
  const strokeColor = color ?? theme.colors.inkPrimary;
  const viewBox = "0 0 24 24";

  switch (name) {
    case "check":
      return (
        <Svg width={size} height={size} viewBox={viewBox} fill="none">
          <Circle cx={12} cy={12} r={9.5} stroke={strokeColor} strokeWidth={1.4} />
          <Path
            d="M7.5 12.5L10.3 15.3L16.5 9"
            stroke={strokeColor}
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case "uncheck":
      return (
        <Svg width={size} height={size} viewBox={viewBox} fill="none">
          <Circle cx={12} cy={12} r={9.5} stroke={strokeColor} strokeWidth={1.4} />
          <Line x1={8} y1={12} x2={16} y2={12} stroke={strokeColor} strokeWidth={1.6} strokeLinecap="round" />
        </Svg>
      );
    case "edit":
      return (
        <Svg width={size} height={size} viewBox={viewBox} fill="none">
          <Path
            d="M15.5 4.5L19.5 8.5L9 19H5V15L15.5 4.5Z"
            stroke={strokeColor}
            strokeWidth={1.4}
            strokeLinejoin="round"
          />
          <Line x1={13.5} y1={6.5} x2={17.5} y2={10.5} stroke={strokeColor} strokeWidth={1.4} />
        </Svg>
      );
    case "delete":
      return (
        <Svg width={size} height={size} viewBox={viewBox} fill="none">
          <Path d="M5 7H19" stroke={strokeColor} strokeWidth={1.4} strokeLinecap="round" />
          <Path d="M9 7V5H15V7" stroke={strokeColor} strokeWidth={1.4} strokeLinejoin="round" />
          <Path
            d="M7 7L7.8 19H16.2L17 7"
            stroke={strokeColor}
            strokeWidth={1.4}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <Line x1={10.5} y1={10.5} x2={10.5} y2={15.5} stroke={strokeColor} strokeWidth={1.2} strokeLinecap="round" />
          <Line x1={13.5} y1={10.5} x2={13.5} y2={15.5} stroke={strokeColor} strokeWidth={1.2} strokeLinecap="round" />
        </Svg>
      );
  }
}

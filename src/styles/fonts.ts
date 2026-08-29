import {
  InstrumentSans_400Regular,
  InstrumentSans_500Medium,
  InstrumentSans_600SemiBold,
} from "@expo-google-fonts/instrument-sans";
import {
  InstrumentSerif_400Regular,
  InstrumentSerif_400Regular_Italic,
} from "@expo-google-fonts/instrument-serif";
import { JetBrainsMono_400Regular, JetBrainsMono_500Medium } from "@expo-google-fonts/jetbrains-mono";

// Font map passed to `useFonts` at the app root. Keys are the RN font-family
// names referenced by `FONT_FAMILY` below.
export const FONT_ASSETS = {
  "InstrumentSans-Regular": InstrumentSans_400Regular,
  "InstrumentSans-Medium": InstrumentSans_500Medium,
  "InstrumentSans-SemiBold": InstrumentSans_600SemiBold,
  "InstrumentSerif-Regular": InstrumentSerif_400Regular,
  "InstrumentSerif-Italic": InstrumentSerif_400Regular_Italic,
  "JetBrainsMono-Regular": JetBrainsMono_400Regular,
  "JetBrainsMono-Medium": JetBrainsMono_500Medium,
};

// Ledger design system typefaces (design/ Concept Directions):
// - Instrument Sans: habit titles, UI copy
// - Instrument Serif: the single large "now" prompt in the focus flow
// - JetBrains Mono: every numeral, timestamp, and tracked-out label
export const FONT_FAMILY = {
  sans: "InstrumentSans-Regular",
  sansMedium: "InstrumentSans-Medium",
  sansSemiBold: "InstrumentSans-SemiBold",
  serif: "InstrumentSerif-Regular",
  serifItalic: "InstrumentSerif-Italic",
  mono: "JetBrainsMono-Regular",
  monoMedium: "JetBrainsMono-Medium",
} as const;

export const palette = {
  background: {
    primary: "#FFFFFF",
    secondary: "#F5F5F7",
  },
  surface: {
    primary: "#F0F0F3",
    border: "#E1E1E6",
  },
  text: {
    primary: "#1A1A1E",
    secondary: "#6E6E76",
    placeholder: "#A0A0A8",
  },
  button: {
    primary: {
      background: "#1A1A1E",
      text: "#FFFFFF",
      disabled: "#C7C7CC",
    },
  },
  states: {
    error: "#D20F39",
    success: "#2E8B57",
  },
  // Ledger design system (design/ Concept Directions, 1a/2a/3c/4c): a single
  // set of semantic tokens shared by the light "ledger" theme and the dark
  // "focus" theme below. Components read these generic names — `pageBackground`,
  // `ruleActive`, etc. — and get the right value from whichever ThemeProvider
  // (`theme` or `focusTheme`) is active, so the same component renders the
  // paper daily record in daylight and the full-bleed focus flow at night.
  ledgerDesignSystem: {
    pageBackground: "#fbfaf7",
    inkPrimary: "#1a1a1a",
    inkMuted: "rgba(0,0,0,0.4)",
    inkFaint: "rgba(0,0,0,0.32)",
    inkFainter: "rgba(0,0,0,0.25)",
    hairline: "rgba(0,0,0,0.08)",
    ruleInactive: "#d9d4c8",
    ruleActive: "#8a5a1c",
    ruleGlow: "transparent",
    doneIdle: "#d9d4c8",
    gapSlot: "rgba(0,0,0,0.08)",
    listItemText: "#1a1a1a",
    listItemMeta: "rgba(0,0,0,0.35)",
  },
  // Focus variant (design/ 1d + 3a/3b/3c + 4c): full-bleed dark, purple
  // accent instead of amber — used only for the one-habit-at-a-time
  // completion flow and its closed-day recap.
  focusDesignSystem: {
    pageBackground: "#100f14",
    inkPrimary: "#ffffff",
    inkMuted: "rgba(255,255,255,0.45)",
    inkFaint: "rgba(255,255,255,0.35)",
    inkFainter: "rgba(255,255,255,0.25)",
    hairline: "rgba(255,255,255,0.14)",
    ruleInactive: "rgba(255,255,255,0.14)",
    ruleActive: "#A695E0",
    ruleGlow: "rgba(166,149,224,0.7)",
    doneIdle: "#e8e5dd",
    gapSlot: "rgba(255,255,255,0.14)",
    listItemText: "rgba(255,255,255,0.62)",
    listItemMeta: "rgba(255,255,255,0.3)",
  },
};

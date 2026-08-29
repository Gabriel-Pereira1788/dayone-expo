import { createTheme } from "@shopify/restyle";
import { palette } from "./palette";

const designSystemColors = {
  pageBackground: palette.ledgerDesignSystem.pageBackground,
  inkPrimary: palette.ledgerDesignSystem.inkPrimary,
  inkMuted: palette.ledgerDesignSystem.inkMuted,
  inkFaint: palette.ledgerDesignSystem.inkFaint,
  inkFainter: palette.ledgerDesignSystem.inkFainter,
  hairline: palette.ledgerDesignSystem.hairline,
  ruleInactive: palette.ledgerDesignSystem.ruleInactive,
  ruleActive: palette.ledgerDesignSystem.ruleActive,
  ruleGlow: palette.ledgerDesignSystem.ruleGlow,
  doneIdle: palette.ledgerDesignSystem.doneIdle,
  gapSlot: palette.ledgerDesignSystem.gapSlot,
  listItemText: palette.ledgerDesignSystem.listItemText,
  listItemMeta: palette.ledgerDesignSystem.listItemMeta,
};

export const theme = createTheme({
  colors: {
    backgroundPrimary: palette.background.primary,
    backgroundSecondary: palette.background.secondary,
    surfacePrimary: palette.surface.primary,
    surfaceBorder: palette.surface.border,
    textPrimary: palette.text.primary,
    textSecondary: palette.text.secondary,
    textPlaceholder: palette.text.placeholder,
    buttonPrimaryBackground: palette.button.primary.background,
    buttonPrimaryText: palette.button.primary.text,
    buttonPrimaryDisabled: palette.button.primary.disabled,
    feedbackError: palette.states.error,
    feedbackSuccess: palette.states.success,
    ...designSystemColors,
  },
  spacing: {
    sp2: 2,
    sp4: 4,
    sp5: 5,
    sp6: 6,
    sp8: 8,
    sp10: 10,
    sp12: 12,
    sp14: 14,
    sp16: 16,
    sp18: 18,
    sp20: 20,
    sp22: 22,
    sp24: 24,
    sp26: 26,
    sp30: 30,
    sp32: 32,
    sp34: 34,
    sp36: 36,
    sp44: 44,
    sp48: 48,
    sp56: 56,
  },
  borderRadii: {
    none: 0,
    rd8: 8,
    rd12: 12,
    rd16: 16,
    rd100: 100,
  },
  textVariants: {
    defaults: {
      color: "textPrimary",
      fontSize: 16,
    },
    title: {
      color: "textPrimary",
      fontSize: 24,
      fontWeight: "700",
    },
    body: {
      color: "textPrimary",
      fontSize: 16,
    },
    caption: {
      color: "textSecondary",
      fontSize: 13,
    },
  },
});

export type Theme = typeof theme;

// The focus flow (design/ 1d + 3a/3b/3c) is always dark regardless of the
// device's system theme — it's a distinct product surface, not a light/dark
// mode toggle. Screens that render it wrap their tree in
// `<ThemeProvider theme={focusTheme}>` locally instead of swapping the root
// theme, so the rest of the app (ledger, forms, auth) stays on `theme`. Every
// design-system component reads the same semantic keys (`pageBackground`,
// `ruleActive`, ...) from `useTheme<Theme>()`, so it renders correctly under
// either provider without knowing which one is active.
export const focusTheme: Theme = {
  ...theme,
  colors: {
    ...theme.colors,
    pageBackground: palette.focusDesignSystem.pageBackground,
    inkPrimary: palette.focusDesignSystem.inkPrimary,
    inkMuted: palette.focusDesignSystem.inkMuted,
    inkFaint: palette.focusDesignSystem.inkFaint,
    inkFainter: palette.focusDesignSystem.inkFainter,
    hairline: palette.focusDesignSystem.hairline,
    ruleInactive: palette.focusDesignSystem.ruleInactive,
    ruleActive: palette.focusDesignSystem.ruleActive,
    ruleGlow: palette.focusDesignSystem.ruleGlow,
    doneIdle: palette.focusDesignSystem.doneIdle,
    gapSlot: palette.focusDesignSystem.gapSlot,
    listItemText: palette.focusDesignSystem.listItemText,
    listItemMeta: palette.focusDesignSystem.listItemMeta,
  },
};

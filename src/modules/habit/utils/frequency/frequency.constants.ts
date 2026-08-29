import type { HabitFrequency } from "@/modules/habit/domain/types";

export const FREQUENCY_LABELS: Record<HabitFrequency, string> = {
  daily: "Diário",
  weekly: "Semanal",
  monthly: "Mensal",
};

export const FREQUENCY_OPTIONS: { value: HabitFrequency; label: string }[] = [
  { value: "daily", label: FREQUENCY_LABELS.daily },
  { value: "weekly", label: FREQUENCY_LABELS.weekly },
  { value: "monthly", label: FREQUENCY_LABELS.monthly },
];

export const DAY_OF_WEEK_OPTIONS: { value: string; label: string }[] = [
  { value: "0", label: "DOM" },
  { value: "1", label: "SEG" },
  { value: "2", label: "TER" },
  { value: "3", label: "QUA" },
  { value: "4", label: "QUI" },
  { value: "5", label: "SEX" },
  { value: "6", label: "SAB" },
];

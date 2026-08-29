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

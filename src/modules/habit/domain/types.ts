export type HabitFrequency = "daily" | "weekly" | "monthly";

export interface Habit {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  icon: string | null;
  frequency: HabitFrequency;
  dayOfWeek: number | null;
  dayOfMonth: number | null;
  hours: number | null;
  minutes: number | null;
  startDate: string;
  endDate: string | null;
  targetDurationInDays: number | null;
  completed: boolean;
  updatedAt: number;
}
export interface CreateHabitInput {
  title: string;
  description: string;
  icon: string;
  frequency: HabitFrequency;
  dayOfWeek: number;
  dayOfMonth: number;
  hours: number;
  minutes: number;
  startDate: string;
  endDate: string;
  targetDurationInDays: number;
}

export type UpdateHabitInput = Partial<CreateHabitInput> & { completed?: boolean };

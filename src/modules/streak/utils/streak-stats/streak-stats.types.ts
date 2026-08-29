export interface DayFlag {
  dateKey: string;
  complete: boolean;
}

export interface DayStreakStats {
  current: number;
  best: number;
  lastBreakDateKey: string | null;
  dailyFlags: DayFlag[];
}

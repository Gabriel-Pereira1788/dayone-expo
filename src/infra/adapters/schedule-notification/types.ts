export type ScheduleFrequency = "daily" | "weekly" | "monthly";

export interface Notification {
  id: string;
  title: string;
  message: string;
}

export interface ScheduleDate {
  hour: number;
  minute: number;
  dayOfWeek?: number;
  dayOfMonth?: number;
}

export interface ScheduleNotificationImpl {
  schedule: (frequency: ScheduleFrequency, notification: Notification, date: ScheduleDate) => void;
  cancel: (id: string) => void;
  addListener: (listener: (id: string) => void) => () => void;
}

import type { Notification, ScheduleDate, ScheduleFrequency, ScheduleNotificationImpl } from "../../types";

function schedule(_frequency: ScheduleFrequency, _notification: Notification, _date: ScheduleDate) {}

function cancel(_id: string) {}

function addListener(_listener: (id: string) => void) {
  return () => {};
}

export const inAppScheduleNotification: ScheduleNotificationImpl = {
  schedule,
  cancel,
  addListener,
};

import { PermissionsAndroid, Platform } from "react-native";
import rnScheduleNotification from "react-native-schedule-notification";
import type { Notification, ScheduleDate, ScheduleFrequency, ScheduleNotificationImpl } from "../../types";

async function ensureAndroidPermission(): Promise<void> {
  if (Platform.OS !== "android" || Platform.Version < 33) return;
  await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
}

function schedule(frequency: ScheduleFrequency, notification: Notification, date: ScheduleDate) {
  ensureAndroidPermission().finally(() => {
    const { hour, minute } = date;
    if (frequency === "weekly") {
      rnScheduleNotification.schedule("weekly", notification, { hour, minute, dayOfWeek: date.dayOfWeek ?? 1 });
    } else if (frequency === "monthly") {
      rnScheduleNotification.schedule("monthly", notification, { hour, minute, dayOfMonth: date.dayOfMonth ?? 1 });
    } else {
      rnScheduleNotification.schedule("daily", notification, { hour, minute });
    }
  });
}

function cancel(id: string) {
  rnScheduleNotification.cancel(id);
}

function addListener(listener: (id: string) => void) {
  return rnScheduleNotification.addListener(listener);
}

export const rnScheduleNotificationImpl: ScheduleNotificationImpl = {
  schedule,
  cancel,
  addListener,
};

import type { AuthServiceImpl } from "@/infra/adapters/auth/types";
import type { ScheduleNotificationImpl } from "@/infra/adapters/schedule-notification/types";
import type { StorageImpl } from "@/infra/adapters/storage/types";

export type ServiceKey = string | symbol;
export type ServiceMap = Map<ServiceKey, any>;

export const enum DIKeys {
  Storage = "Storage",
  AuthService = "AuthService",
  ScheduleNotification = "ScheduleNotification",
}

export interface DIValues {
  [DIKeys.Storage]: StorageImpl;
  [DIKeys.AuthService]: AuthServiceImpl;
  [DIKeys.ScheduleNotification]: ScheduleNotificationImpl;
}

import { useDI } from "@/infra/DI/context/DIContext";
import { DIKeys } from "@/infra/DI/types";

export function useScheduleNotification() {
  return useDI(DIKeys.ScheduleNotification);
}

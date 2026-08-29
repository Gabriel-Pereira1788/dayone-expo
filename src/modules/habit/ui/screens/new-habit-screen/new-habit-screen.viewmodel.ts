import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "expo-router";
import { useCreateHabit } from "@/modules/habit/domain/useCases/create-habit";
import { toDateKey } from "@/shared/helpers/date";

const optionalNumber = z.string().optional();

function parseOptionalNumber(value: string | undefined): number {
  if (!value || value.trim().length === 0) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

const newHabitSchema = z.object({
  title: z.string().min(1, "Título obrigatório"),
  description: z.string().optional(),
  icon: z.string().optional(),
  frequency: z.enum(["daily", "weekly", "monthly"]),
  startDate: z.string().min(1, "Data de início obrigatória"),
  endDate: z.string().optional(),
  dayOfWeek: optionalNumber,
  dayOfMonth: optionalNumber,
  hours: optionalNumber,
  minutes: optionalNumber,
  targetDurationInDays: optionalNumber,
});

export type NewHabitFormValues = z.input<typeof newHabitSchema>;

export function useNewHabitScreenViewModel() {
  const router = useRouter();
  const createHabit = useCreateHabit();

  const form = useForm<NewHabitFormValues>({
    resolver: zodResolver(newHabitSchema),
    defaultValues: {
      title: "",
      description: "",
      icon: "",
      frequency: "daily",
      startDate: toDateKey(new Date()),
      endDate: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    const parsed = newHabitSchema.parse(values);
    createHabit({
      title: parsed.title,
      description: parsed.description ?? "",
      icon: parsed.icon ?? "",
      frequency: parsed.frequency,
      startDate: parsed.startDate,
      endDate: parsed.endDate ?? "",
      dayOfWeek: parseOptionalNumber(parsed.dayOfWeek),
      dayOfMonth: parseOptionalNumber(parsed.dayOfMonth),
      hours: parseOptionalNumber(parsed.hours),
      minutes: parseOptionalNumber(parsed.minutes),
      targetDurationInDays: parseOptionalNumber(parsed.targetDurationInDays),
    });
    router.back();
  });

  function cancel() {
    router.back();
  }

  return { form, onSubmit, cancel };
}

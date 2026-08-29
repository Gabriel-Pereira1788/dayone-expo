import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useGetHabit } from "@/modules/habit/domain/useCases/get-habit";
import { useUpdateHabit } from "@/modules/habit/domain/useCases/update-habit";

const optionalNumber = z.string().optional();

function parseOptionalNumber(value: string | undefined): number {
  if (!value || value.trim().length === 0) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseDayOfMonth(value: string | undefined): number {
  if (!value || value.trim().length === 0) return 1;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 1;
}

const editHabitSchema = z.object({
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
});

export type EditHabitFormValues = z.input<typeof editHabitSchema>;

export function useEditHabitScreenViewModel() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: habitRows } = useGetHabit(id);
  const updateHabit = useUpdateHabit();
  const habit = habitRows?.[0] ?? null;

  const form = useForm<EditHabitFormValues>({
    resolver: zodResolver(editHabitSchema),
    defaultValues: {
      title: "",
      description: "",
      icon: "",
      frequency: "daily",
      startDate: "",
      endDate: "",
      dayOfWeek: "0",
      dayOfMonth: "1",
    },
  });

  useEffect(() => {
    if (!habit) return;
    form.reset({
      title: habit.title,
      description: habit.description ?? "",
      icon: habit.icon ?? "",
      frequency: habit.frequency as EditHabitFormValues["frequency"],
      startDate: habit.startDate,
      endDate: habit.endDate ?? "",
      dayOfWeek: habit.dayOfWeek != null ? String(habit.dayOfWeek) : "0",
      dayOfMonth: habit.dayOfMonth != null ? String(habit.dayOfMonth) : "1",
      hours: habit.hours != null ? String(habit.hours) : "",
      minutes: habit.minutes != null ? String(habit.minutes) : "",
    });
  }, [habit]);

  const onSubmit = form.handleSubmit((values) => {
    const parsed = editHabitSchema.parse(values);
    updateHabit(id, {
      title: parsed.title,
      description: parsed.description ?? "",
      icon: parsed.icon ?? "",
      frequency: parsed.frequency,
      startDate: parsed.startDate,
      endDate: parsed.endDate ?? "",
      dayOfWeek: parseOptionalNumber(parsed.dayOfWeek),
      dayOfMonth: parseDayOfMonth(parsed.dayOfMonth),
      hours: parseOptionalNumber(parsed.hours),
      minutes: parseOptionalNumber(parsed.minutes),
    });
    router.back();
  });

  function cancel() {
    router.back();
  }

  return { form, onSubmit, habit, cancel, frequency: form.watch("frequency") };
}

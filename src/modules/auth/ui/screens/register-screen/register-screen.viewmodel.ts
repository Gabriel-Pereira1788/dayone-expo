import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRegister } from "@/modules/auth/domain/useCases/register";

const registerSchema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

export function useRegisterScreenViewModel() {
  const { mutate, isPending, error } = useRegister();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = form.handleSubmit((values) => {
    mutate(values);
  });

  return { form, onSubmit, isPending, error };
}

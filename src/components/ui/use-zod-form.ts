import { zodResolver } from "@hookform/resolvers/zod";
import { UseFormProps, useForm } from "react-hook-form";
import { z } from "zod";

export function useZodForm<T extends z.ZodType>(
  schema: T,
  options: Omit<UseFormProps<z.infer<T>>, "resolver"> = {}
) {
  return useForm<z.infer<T>>({ resolver: zodResolver(schema), ...options });
}

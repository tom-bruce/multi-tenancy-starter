import { z } from "zod";

export function parseFormData<S extends z.ZodObject<any>>(
  formData: FormData,
  schema: S
): z.infer<S> {
  const data = Object.fromEntries(formData.entries());
  return schema.parse(data);
}

/**
 * Asserts that a value is never. This is a utility to enforce exhaustive matching in switch statements.
 */
export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${value}`);
}

export function sluggify(input: string): string {
  return input
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

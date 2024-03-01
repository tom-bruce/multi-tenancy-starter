import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

export function parseFormData<S extends z.ZodObject<any>>(
  formData: FormData,
  schema: S
): z.infer<S> {
  const data = Object.fromEntries(formData.entries());
  return schema.parse(data);
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Asserts that a value is never. This is a utility to enforce exhaustive matching in switch statements.
 */
export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${value}`);
}

export function sluggify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getBaseUrl() {
  if (typeof window !== "undefined")
    // browser should use relative path
    return "";
  if (process.env.CUSTOM_URL) return `https://${process.env.CUSTOM_URL}`;
  if (process.env.VERCEL_URL)
    // reference for vercel.com
    return `https://${process.env.VERCEL_URL}`;
  if (process.env.RENDER_INTERNAL_HOSTNAME)
    // reference for render.com
    return `http://${process.env.RENDER_INTERNAL_HOSTNAME}:${process.env.PORT}`;
  // assume localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

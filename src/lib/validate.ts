import { z } from "zod";

/**
 * Validate a plain object against a Zod schema.
 * Returns the first error message on failure.
 */
export function validateData<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (!result.success) {
    const msg = result.error.issues.map((e) => e.message).join(". ");
    return { success: false, error: msg };
  }
  return { success: true, data: result.data };
}

/**
 * Sanitize a user search string to prevent SQL injection via ilike.
 * Escapes %, _, and backslash characters.
 */
export function sanitizeSearch(input: string): string {
  return input
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_")
    .replace(/['"();]/g, "");
}

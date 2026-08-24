export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

export function firstZodError(error: { issues: { message: string }[] }): string {
  return error.issues[0]?.message ?? "Invalid input";
}

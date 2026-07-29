import "server-only";

/**
 * Next.js redacts thrown Error messages from Server Actions in production
 * builds (shows a generic "Server Components render" message instead).
 * Wrap actions that need to surface a specific validation message with this
 * so the message survives as a normal return value instead of a thrown error.
 */
export async function runAction<T>(fn: () => Promise<T>): Promise<T | { error: string }> {
  try {
    return await fn();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Ocorreu um erro inesperado. Tente novamente." };
  }
}

export function isActionError(value: unknown): value is { error: string } {
  return Boolean(value) && typeof value === "object" && "error" in (value as object);
}

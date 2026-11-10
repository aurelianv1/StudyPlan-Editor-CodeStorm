/**
 * Incremental parser for a `text/event-stream` body.
 *
 * Network chunks do not respect line boundaries, so a line may arrive in two
 * pieces. The parser keeps the unfinished tail until the rest shows up.
 */
export function createSseParser() {
  let buffer = "";

  return {
    /** Feed a decoded chunk and get the `data:` payloads completed by it. */
    push(chunk: string): string[] {
      buffer += chunk;
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? "";
      return lines
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice("data:".length).trim());
    },
  };
}

export const SSE_DONE = "[DONE]";

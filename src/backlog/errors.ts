export class BacklogApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "BacklogApiError";
  }
}

export function toReadableError(error: unknown): string {
  if (error instanceof BacklogApiError) {
    let message = error.message;
    if (error.details) {
      try {
        const detailsString = JSON.stringify(error.details, null, 2);
        message += ` (Details: ${detailsString})`;
      } catch {
        // Fallback if details cannot be stringified
      }
    }
    return message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error";
}


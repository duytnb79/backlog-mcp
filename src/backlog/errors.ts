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
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error";
}

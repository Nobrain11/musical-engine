function timestamp(): string {
  return new Date().toISOString();
}

function formatError(
  error: unknown,
): string {
  if (error instanceof Error) {
    return (
      error.stack ??
      error.message
    );
  }

  if (
    typeof error === "string"
  ) {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

export const logger = {
  info(
    message: string,
    meta?: unknown,
  ): void {
    if (
      meta === undefined
    ) {
      console.log(
        `[${timestamp()}] INFO ${message}`,
      );
      return;
    }

    console.log(
      `[${timestamp()}] INFO ${message}`,
      meta,
    );
  },

  warn(
    message: string,
    meta?: unknown,
  ): void {
    if (
      meta === undefined
    ) {
      console.warn(
        `[${timestamp()}] WARN ${message}`,
      );
      return;
    }

    console.warn(
      `[${timestamp()}] WARN ${message}`,
      meta,
    );
  },

  error(
    message: string,
    error?: unknown,
  ): void {
    if (
      error === undefined
    ) {
      console.error(
        `[${timestamp()}] ERROR ${message}`,
      );
      return;
    }

    console.error(
      `[${timestamp()}] ERROR ${message}`,
      formatError(error),
    );
  },

  debug(
    message: string,
    meta?: unknown,
  ): void {
    if (
      process.env.NODE_ENV ===
      "production"
    ) {
      return;
    }

    if (
      meta === undefined
    ) {
      console.debug(
        `[${timestamp()}] DEBUG ${message}`,
      );
      return;
    }

    console.debug(
      `[${timestamp()}] DEBUG ${message}`,
      meta,
    );
  },
};

export default logger;

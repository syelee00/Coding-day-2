type RetryOptions = {
  maxAttempts?: number;
  wait?: (milliseconds: number) => Promise<void>;
};

const isRetryable = (error: unknown) => /\b(429|500|502|503|504)\b|UNAVAILABLE|high demand/i.test(
  error instanceof Error ? error.message : String(error),
);

const pause = (milliseconds: number) => new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

export async function retryGeminiRequest<T>(request: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  const wait = options.wait ?? pause;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await request();
    } catch (error) {
      if (!isRetryable(error) || attempt === maxAttempts) throw error;
      await wait(200 * 2 ** (attempt - 1));
    }
  }

  throw new Error("Gemini retry attempts exhausted");
}

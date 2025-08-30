// src/lib/retry.ts
export async function withRetry<T>(fn: () => Promise<T>, tries = 3, backoffMs = 400) {
  let lastErr: unknown;
  for (let i = 0; i < tries; i++) {
    try { return await fn(); } catch (e) { lastErr = e; }
    await new Promise(r => setTimeout(r, backoffMs * (i + 1)));
  }
  throw lastErr;
}

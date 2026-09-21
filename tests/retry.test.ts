import assert from "node:assert/strict";
import test from "node:test";

import { retryGeminiRequest } from "../lib/retry";

test("retries a temporary 503 failure and returns the later successful response", async () => {
  let attempts = 0;
  const result = await retryGeminiRequest(async () => {
    attempts += 1;
    if (attempts < 3) throw new Error("ApiError: 503 UNAVAILABLE");
    return "recommended";
  }, { wait: async () => {} });

  assert.equal(result, "recommended");
  assert.equal(attempts, 3);
});

test("does not retry a permanent 404 model error", async () => {
  let attempts = 0;
  await assert.rejects(() => retryGeminiRequest(async () => {
    attempts += 1;
    throw new Error("ApiError: 404 model not found");
  }, { wait: async () => {} }));

  assert.equal(attempts, 1);
});

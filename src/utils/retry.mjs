export async function retry(fn, { attempts = 3, delayMs = 1000, backoffMultiplier = 2 } = {}) {
  let lastErr, delay = delayMs;
  for (let i = 0; i < attempts; i++) {
    try { return await fn(); }
    catch (err) {
      lastErr = err;
      if (i < attempts - 1) {
        console.warn(`[retry] Attempt ${i + 1}/${attempts} failed: ${err.message}. Retrying in ${delay}ms…`);
        await new Promise(r => setTimeout(r, delay));
        delay = Math.round(delay * backoffMultiplier);
      }
    }
  }
  throw new Error(`All ${attempts} attempts failed. Last: ${lastErr?.message}`);
}

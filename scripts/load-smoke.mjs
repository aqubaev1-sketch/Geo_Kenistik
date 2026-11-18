import { performance } from "node:perf_hooks";

const base = process.argv[2];
const concurrency = Number(process.argv[3] || 50);
if (!base || !Number.isInteger(concurrency) || concurrency < 1) throw new Error("Usage: load-smoke.mjs <base-url> <concurrency>");
const catalogHtml = await (await fetch(`${base}/courses`)).text();
const courseMatch = catalogHtml.match(/href="(\/courses\/[^"/]+)"/);
const paths = ["/", "/courses", "/laboratory", ...(courseMatch ? [courseMatch[1]] : [])];
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 20_000);
const started = performance.now();
const results = await Promise.all(Array.from({ length: concurrency }, async (_, index) => {
  const begin = performance.now();
  try {
    const response = await fetch(`${base}${paths[index % paths.length]}`, { signal: controller.signal });
    await response.arrayBuffer();
    return { ok: response.ok, status: response.status, ms: performance.now() - begin };
  } catch (error) {
    return { ok: false, status: 0, ms: performance.now() - begin, error: String(error) };
  }
}));
clearTimeout(timeout);
const failures = results.filter((item) => !item.ok);
const sorted = results.map((item) => item.ms).sort((a,b) => a-b);
const p95 = sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * .95) - 1)];
if (failures.length) throw new Error(`${failures.length}/${concurrency} requests failed`);
if (p95 > 5000) throw new Error(`p95 ${p95.toFixed(0)}ms exceeds 5000ms`);
console.log(`load smoke verification passed requests=${concurrency} p95=${p95.toFixed(0)}ms total=${(performance.now()-started).toFixed(0)}ms`);

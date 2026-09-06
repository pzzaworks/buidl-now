#!/usr/bin/env node
/**
 * IndexNow submitter.
 *
 * Pulls the live sitemap for this site and notifies the IndexNow network
 * (Bing, Yandex, and other participating engines) about the current URL set,
 * so content changes get picked up in minutes instead of waiting for the next
 * organic crawl. Safe to run repeatedly and idempotent.
 *
 * Verification file: public/395e31e5addafb3a12e9d112816aa204.txt is served at
 * https://buidlnow.com/395e31e5addafb3a12e9d112816aa204.txt and contains the key below.
 *
 * Usage:  npm run indexnow            (submits every URL in the sitemap)
 * Coolify runs it as the post-deployment command inside the fresh container.
 * The sitemap is read from the container's own server first, because right
 * after a rolling update the public hostname can still point at the old
 * container (or answer 502 while the proxy switches over).
 */

const HOST = "buidlnow.com";
const KEY = "395e31e5addafb3a12e9d112816aa204";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const PUBLIC_ORIGIN = `https://${HOST}`;
const LOCAL_ORIGIN = `http://127.0.0.1:${process.env.PORT || 3000}`;
const SITEMAP_PATH = "/sitemap.xml";
const ENDPOINT = "https://api.indexnow.org/indexnow";
const BATCH_SIZE = 10000; // IndexNow allows up to 10k URLs per request.

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchText(url) {
  const res = await fetch(url, { headers: { "User-Agent": "indexnow-submitter" } });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return res.text();
}

// Try the local server first, then the public origin, and retry with a
// growing pause so a proxy that is still switching containers does not fail
// the whole run.
async function fetchSitemapText(path, attempts = 5) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    for (const origin of [LOCAL_ORIGIN, PUBLIC_ORIGIN]) {
      try {
        return await fetchText(`${origin}${path}`);
      } catch (err) {
        lastError = err;
      }
    }
    if (attempt < attempts) await sleep(3000 * attempt);
  }
  throw lastError;
}

// Sitemap-index children are absolute public URLs; map them back to a path so
// they go through the same local-first fetch.
function toPath(url) {
  return url.startsWith(PUBLIC_ORIGIN) ? url.slice(PUBLIC_ORIGIN.length) : url;
}

function extractLocs(xml) {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1]);
}

// Collect every page URL, following one level of sitemap-index nesting.
async function collectUrls() {
  const root = await fetchSitemapText(SITEMAP_PATH);
  if (/<sitemapindex/i.test(root)) {
    const children = extractLocs(root);
    const all = [];
    for (const child of children) {
      try {
        all.push(...extractLocs(await fetchSitemapText(toPath(child))));
      } catch (err) {
        console.warn(`  ! skipped ${child}: ${err.message}`);
      }
    }
    return all;
  }
  return extractLocs(root);
}

async function submitBatch(urlList) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
  });
  return res.status;
}

async function main() {
  const urls = [...new Set(await collectUrls())].filter((u) => u.startsWith(`https://${HOST}`));
  if (urls.length === 0) {
    console.error(`No URLs found in ${PUBLIC_ORIGIN}${SITEMAP_PATH}. Nothing to submit.`);
    process.exit(1);
  }
  console.log(`Submitting ${urls.length} URL(s) for ${HOST} to IndexNow...`);
  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE);
    const status = await submitBatch(batch);
    // 200 = accepted, 202 = accepted (pending). Anything else is worth surfacing.
    const ok = status === 200 || status === 202;
    console.log(`  batch ${i / BATCH_SIZE + 1}: ${batch.length} URLs -> HTTP ${status} ${ok ? "OK" : "FAILED"}`);
    if (!ok) process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("IndexNow submission failed:", err.message);
  process.exit(1);
});

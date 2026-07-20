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
 * Wire it into your deploy step to fire automatically after each release.
 */

const HOST = "buidlnow.com";
const KEY = "395e31e5addafb3a12e9d112816aa204";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const SITEMAP_URL = `https://${HOST}/sitemap.xml`;
const ENDPOINT = "https://api.indexnow.org/indexnow";
const BATCH_SIZE = 10000; // IndexNow allows up to 10k URLs per request.

async function fetchText(url) {
  const res = await fetch(url, { headers: { "User-Agent": "indexnow-submitter" } });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return res.text();
}

function extractLocs(xml) {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1]);
}

// Collect every page URL, following one level of sitemap-index nesting.
async function collectUrls() {
  const root = await fetchText(SITEMAP_URL);
  if (/<sitemapindex/i.test(root)) {
    const children = extractLocs(root);
    const all = [];
    for (const child of children) {
      try {
        all.push(...extractLocs(await fetchText(child)));
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
    console.error(`No URLs found in ${SITEMAP_URL}. Nothing to submit.`);
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

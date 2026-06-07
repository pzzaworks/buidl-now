import { NextRequest } from "next/server";
import https from "node:https";
import type { IncomingHttpHeaders } from "node:http";

// First-party proxy for Rybbit analytics.
//
// The browser talks to this same-origin endpoint (adblock resistant) and we
// forward each request to the Rybbit backend while preserving the real visitor
// IP so events are geolocated to the visitor, not this server.
//
// Why not just fetch https://analytics.pzza.works? That host is Cloudflare
// proxied, so a server-side request to it would have its CF-Connecting-IP
// rewritten to this server's IP and the visitor IP would be lost. Instead we
// connect to the internal Traefik proxy directly (bypassing Cloudflare) while
// presenting the analytics host via SNI + Host header, so Traefik routes to the
// Rybbit stack and the existing TLS certificate stays valid. The CF-Connecting-IP
// we set then survives all the way to the backend.
const ORIGIN_HOST = process.env.RYBBIT_ORIGIN_HOST ?? "analytics.pzza.works";
const PROXY_HOST = process.env.RYBBIT_PROXY_HOST ?? "coolify-proxy";
const PROXY_PORT = Number(process.env.RYBBIT_PROXY_PORT ?? "443");

export const dynamic = "force-dynamic";

// Headers that must not be copied verbatim onto the upstream request.
const HOP_BY_HOP = new Set([
  "host",
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "content-length",
  "accept-encoding",
]);

// Response headers that describe the framing we re-derive ourselves.
const STRIPPED_RESPONSE_HEADERS = new Set([
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "connection",
  "keep-alive",
]);

function getClientIp(req: NextRequest): string {
  const cf = req.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();

  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }

  return req.headers.get("x-real-ip")?.trim() ?? "";
}

function buildResponseHeaders(upstream: IncomingHttpHeaders): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(upstream)) {
    if (value == null || STRIPPED_RESPONSE_HEADERS.has(key)) continue;
    headers.set(key, Array.isArray(value) ? value.join(", ") : value);
  }
  return headers;
}

async function proxy(req: NextRequest, path: string[]): Promise<Response> {
  const upstreamPath = `/api/${path.join("/")}${req.nextUrl.search}`;

  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key)) headers[key] = value;
  });
  // Route to the Rybbit stack and keep the upstream uncompressed so we can pass
  // the body through without re-encoding.
  headers.host = ORIGIN_HOST;
  headers["accept-encoding"] = "identity";

  // Make Rybbit geolocate the visitor, not this server.
  const ip = getClientIp(req);
  if (ip) {
    headers["x-forwarded-for"] = ip;
    headers["cf-connecting-ip"] = ip;
  }

  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const body = hasBody ? Buffer.from(await req.arrayBuffer()) : undefined;
  if (body) headers["content-length"] = String(body.byteLength);

  return new Promise<Response>((resolve, reject) => {
    const upstream = https.request(
      {
        host: PROXY_HOST,
        port: PROXY_PORT,
        path: upstreamPath,
        method: req.method,
        servername: ORIGIN_HOST, // SNI + certificate verification target
        headers,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("error", reject);
        res.on("end", () => {
          const status = res.statusCode ?? 502;
          // 101/204/205/304 are null-body statuses. The Response constructor
          // throws a TypeError if handed a body (even an empty Buffer) for
          // these, so we must pass null. A conditional request from the browser
          // (If-None-Match) makes the upstream answer 304; without this guard
          // the throw happens inside this callback, the promise never resolves,
          // and the request hangs forever (browser stuck loading).
          const isNullBody =
            status === 101 || status === 204 || status === 205 || status === 304;
          try {
            resolve(
              new Response(isNullBody ? null : Buffer.concat(chunks), {
                status,
                headers: buildResponseHeaders(res.headers),
              })
            );
          } catch (error) {
            reject(error);
          }
        });
      }
    );

    upstream.on("error", reject);
    if (body) upstream.write(body);
    upstream.end();
  });
}

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
): Promise<Response> {
  const { path } = await params;
  return proxy(req, path ?? []);
}

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
  handler as OPTIONS,
  handler as HEAD,
};

import { NextRequest, NextResponse } from "next/server";
import { normalizeEnsName, resolveEnsAddress } from "@/lib/ens";

// Fixed public endpoints tried in order. The route never accepts a caller-supplied
// RPC URL: that would let anyone make this server send requests to arbitrary hosts
// (SSRF). Custom RPCs are queried from the browser instead.
const PUBLIC_RPC_ENDPOINTS = [
  "https://ethereum.publicnode.com",
  "https://1rpc.io/eth",
  "https://eth.drpc.org",
];

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const ensName =
    typeof body === "object" && body !== null && "ensName" in body ? body.ensName : undefined;
  const name = typeof ensName === "string" ? normalizeEnsName(ensName) : null;
  if (!name) {
    return NextResponse.json({ error: "Invalid ENS name" }, { status: 400 });
  }

  for (const rpc of PUBLIC_RPC_ENDPOINTS) {
    try {
      const address = await resolveEnsAddress(name, rpc, { ccipRead: false });
      if (!address) {
        return NextResponse.json({ error: "ENS name not found" }, { status: 404 });
      }
      return NextResponse.json({ address });
    } catch (error) {
      console.warn(`ENS RPC ${rpc} failed:`, error instanceof Error ? error.message : error);
    }
  }

  // Upstream details stay in the server log; the client gets a generic message.
  return NextResponse.json({ error: "Failed to resolve ENS name" }, { status: 502 });
}

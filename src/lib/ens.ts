import { createPublicClient, http, type Address } from "viem";
import { mainnet } from "viem/chains";
import { normalize } from "viem/ens";

// DNS caps a full name at 253 characters; anything longer is not a valid ENS name.
const ENS_NAME_MAX_LENGTH = 253;

/** Returns the normalized `.eth` name, or null when the input is not a resolvable ENS name. */
export function normalizeEnsName(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed.endsWith(".eth") || trimmed.length > ENS_NAME_MAX_LENGTH) {
    return null;
  }
  try {
    return normalize(trimmed);
  } catch {
    return null;
  }
}

interface ResolveOptions {
  /**
   * Follow EIP-3668 offchain lookups. These fetch gateway URLs chosen by the
   * name's resolver contract, so server-side callers must keep this off.
   */
  ccipRead: boolean;
}

/**
 * Resolves a normalized ENS name to its address through the Universal Resolver.
 * Returns null when the name has no address; throws when the RPC call fails.
 */
export async function resolveEnsAddress(
  normalizedName: string,
  rpcUrl: string,
  { ccipRead }: ResolveOptions,
): Promise<Address | null> {
  const client = createPublicClient({
    chain: mainnet,
    transport: http(rpcUrl, { timeout: 10_000, retryCount: 1 }),
    ...(ccipRead ? {} : { ccipRead: false as const }),
  });
  return client.getEnsAddress({ name: normalizedName });
}

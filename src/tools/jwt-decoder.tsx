"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToolConfig } from "@/types/tool";

interface DecodedJWT {
  header: string;
  payload: string;
  signature: string;
  headerDecoded: any;
  payloadDecoded: any;
}

export function JwtDecoderTool() {
  const t = useTranslations("toolUI.jwt-decoder");
  const [input, setInput] = useState("");
  const [decoded, setDecoded] = useState<DecodedJWT | null>(null);
  const [error, setError] = useState("");

  const base64UrlDecode = (str: string): string => {
    // Replace URL-safe characters
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");

    // Add padding if needed
    const padding = base64.length % 4;
    if (padding) {
      base64 += "=".repeat(4 - padding);
    }

    try {
      return atob(base64);
    } catch (e) {
      throw new Error(t("invalidBase64"));
    }
  };

  const handleDecode = (token: string) => {
    setInput(token);
    setError("");
    setDecoded(null);

    if (!token.trim()) {
      return;
    }

    try {
      // Split the JWT into its three parts
      const parts = token.split(".");

      if (parts.length !== 3) {
        setError(t("invalidFormat"));
        return;
      }

      const [headerB64, payloadB64, signatureB64] = parts;

      // Decode header and payload
      const headerJson = base64UrlDecode(headerB64);
      const payloadJson = base64UrlDecode(payloadB64);

      let headerDecoded: any;
      let payloadDecoded: any;

      try {
        headerDecoded = JSON.parse(headerJson);
      } catch (e) {
        throw new Error(t("invalidHeaderJson"));
      }

      try {
        payloadDecoded = JSON.parse(payloadJson);
      } catch (e) {
        throw new Error(t("invalidPayloadJson"));
      }

      setDecoded({
        header: headerB64,
        payload: payloadB64,
        signature: signatureB64,
        headerDecoded,
        payloadDecoded,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : t("decodeError"));
    }
  };

  const formatJSON = (obj: any): string => {
    return JSON.stringify(obj, null, 2);
  };

  const formatTimestamp = (timestamp: number): string => {
    try {
      return new Date(timestamp * 1000).toLocaleString();
    } catch (e) {
      return t("invalidDate");
    }
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <div>
        <Label className="mb-2 block text-sm">{t("tokenLabel")}</Label>
        <Textarea
          value={input}
          onChange={(e) => handleDecode(e.target.value)}
          placeholder={t("tokenPlaceholder")}
          className="min-h-[120px] text-sm"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-950/20 border border-red-800/30 rounded-[12px] text-[var(--color-red-500)] text-sm">
          {error}
        </div>
      )}

      {/* Decoded Output */}
      {decoded && (
        <div className="space-y-4">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-semibold text-blue-400">{t("header")}</Label>
            </div>
            <div className="p-3 bg-[var(--color-gray-0)] border border-border rounded-[12px] space-y-2">
              <div>
                <div className="text-xs text-muted-foreground mb-1">{t("encoded")}</div>
                <Input
                  value={decoded.header}
                  readOnly
                  className="font-mono text-xs bg-[var(--color-gray-0)]"
                />
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">{t("decoded")}</div>
                <Textarea
                  value={formatJSON(decoded.headerDecoded)}
                  readOnly
                  showCopy
                  className="font-mono text-xs bg-[var(--color-gray-0)] min-h-[80px]"
                />
              </div>
            </div>
          </div>

          {/* Payload */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-semibold text-blue-400">{t("payload")}</Label>
            </div>
            <div className="p-3 bg-[var(--color-gray-0)] border border-border rounded-[12px] space-y-2">
              <div>
                <div className="text-xs text-muted-foreground mb-1">{t("encoded")}</div>
                <Input
                  value={decoded.payload}
                  readOnly
                  className="font-mono text-xs bg-[var(--color-gray-0)]"
                />
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">{t("decoded")}</div>
                <Textarea
                  value={formatJSON(decoded.payloadDecoded)}
                  readOnly
                  showCopy
                  className="font-mono text-xs bg-[var(--color-gray-0)] min-h-[120px]"
                />
              </div>

              {/* Common Claims */}
              {(decoded.payloadDecoded.iat ||
                decoded.payloadDecoded.exp ||
                decoded.payloadDecoded.nbf) && (
                <div className="pt-2 border-t border-border">
                  <div className="text-xs text-muted-foreground mb-2">
                    {t("timestampClaims")}
                  </div>
                  <div className="space-y-1 text-xs">
                    {decoded.payloadDecoded.iat && (
                      <div>
                        <span className="text-muted-foreground">{t("issuedAt")}</span>{" "}
                        {formatTimestamp(decoded.payloadDecoded.iat)}
                      </div>
                    )}
                    {decoded.payloadDecoded.exp && (
                      <div>
                        <span className="text-muted-foreground">{t("expiresAt")}</span>{" "}
                        {formatTimestamp(decoded.payloadDecoded.exp)}
                      </div>
                    )}
                    {decoded.payloadDecoded.nbf && (
                      <div>
                        <span className="text-muted-foreground">{t("notBefore")}</span>{" "}
                        {formatTimestamp(decoded.payloadDecoded.nbf)}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Signature */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-semibold text-blue-400">{t("signature")}</Label>
            </div>
            <div className="p-3 bg-[var(--color-gray-0)] border border-border rounded-[12px]">
              <Input
                value={decoded.signature}
                readOnly
                className="font-mono text-xs bg-[var(--color-gray-0)]"
              />
              <div className="mt-2 text-xs text-muted-foreground">
                {t("signatureHelp")}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const jwtDecoderConfig: ToolConfig = {
  id: "jwt-decoder",
  name: "JWT Decoder",
  description: "Decode and inspect JSON Web Tokens (JWT) to view header, payload, and signature",
  category: "encoders-decoders",
  component: JwtDecoderTool,
  sections: [
    {
      title: "What is a JWT?",
      content:
        "JSON Web Token (JWT) is a compact, URL-safe means of representing claims to be transferred between two parties. It consists of three parts: Header, Payload, and Signature, separated by dots (.).",
    },
    {
      title: "How does it work?",
      content: (
        <>
          <h4 className="text-base font-semibold mb-2">JWT Structure</h4>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li>
              <strong>Header:</strong> Contains the token type (JWT) and the signing
              algorithm (e.g., HS256, RS256)
            </li>
            <li>
              <strong>Payload:</strong> Contains the claims - statements about an
              entity and additional data
            </li>
            <li>
              <strong>Signature:</strong> Used to verify the token hasn&apos;t been
              tampered with
            </li>
          </ul>

          <h4 className="text-base font-semibold mb-2">Common Claims</h4>
          <ul className="list-disc list-inside space-y-1 text-sm mb-4">
            <li><strong>iss:</strong> Issuer of the token</li>
            <li><strong>sub:</strong> Subject (user identifier)</li>
            <li><strong>aud:</strong> Audience (intended recipient)</li>
            <li><strong>exp:</strong> Expiration time</li>
            <li><strong>iat:</strong> Issued at time</li>
            <li><strong>nbf:</strong> Not before time</li>
          </ul>

          <h4 className="text-base font-semibold mb-2">Security Note</h4>
          <p className="text-sm">
            This tool only decodes the JWT - it does NOT verify the signature. JWTs are not encrypted, only base64url encoded, so never put sensitive data in them. Always verify JWTs server-side.
          </p>
        </>
      ),
    },
  ],
  examples: [
    {
      title: "Example JWT structure",
      content: "header.payload.signature → Three base64url-encoded parts separated by dots",
      type: "code",
    },
  ],
  codeSnippet: `type DecodedJWT = {
  header: any;
  payload: any;
  signature: string;
};

// Decode base64url (JWT uses a URL-safe variant of base64)
function base64UrlDecode(str: string): string {
  // Replace URL-safe characters
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');

  // Add padding if needed
  const padding = base64.length % 4;
  if (padding) {
    base64 += '='.repeat(4 - padding);
  }

  return Buffer.from(base64, 'base64').toString('utf-8');
}

// Decode JWT token
function decodeJwt(token: string): DecodedJWT {
  const parts = token.split('.');

  if (parts.length !== 3) {
    throw new Error('Invalid JWT format. A JWT must have exactly 3 parts separated by dots.');
  }

  const [headerB64, payloadB64, signatureB64] = parts;

  try {
    const headerJson = base64UrlDecode(headerB64);
    const payloadJson = base64UrlDecode(payloadB64);

    return {
      header: JSON.parse(headerJson),
      payload: JSON.parse(payloadJson),
      signature: signatureB64,
    };
  } catch (e) {
    throw new Error(\`Failed to decode JWT: \${e instanceof Error ? e.message : 'Unknown error'}\`);
  }
}

// Example usage
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

const decoded = decodeJwt(token);

console.log('Header:', JSON.stringify(decoded.header, null, 2));
console.log('Payload:', JSON.stringify(decoded.payload, null, 2));
console.log('Signature:', decoded.signature);

// Output:
// Header: { "alg": "HS256", "typ": "JWT" }
// Payload: { "sub": "1234567890", "name": "John Doe", "iat": 1516239022 }`,
  references: [
    {
      title: "JWT.io - Introduction to JSON Web Tokens",
      url: "https://jwt.io/introduction",
    },
    {
      title: "RFC 7519 - JSON Web Token (JWT)",
      url: "https://tools.ietf.org/html/rfc7519",
    },
    {
      title: "MDN - JSON Web Tokens",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API/Authenticator_data",
    },
  ],
};

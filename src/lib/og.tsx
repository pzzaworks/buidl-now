import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const ogImageSize = { width: 1200, height: 630 } as const;
export const ogContentType = "image/png";

const brandYellow = "#f0fb29";
const brandDark = "#202020";

function loadAsset(relativePath: string): string {
  const buffer = readFileSync(join(process.cwd(), "public", relativePath));
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

// Real brand marks: the inverted "b" tile (dark slab, yellow cut-out) and the
// BUIDL NOW! wordmark, both from the source SVGs.
const brandIcon = loadAsset("og/mark.png");
const brandWordmark = loadAsset("og/wordmark.png");

// The site's content font (Chakra Petch) so the title matches the app.
const fontData = readFileSync(join(process.cwd(), "public", "og", "font.ttf"));
const FONT_FAMILY = "Chakra Petch";

interface OgImageOptions {
  /** Large headline, typically the tool name or page title. */
  title: string;
}

export function createOgImage({ title }: OgImageOptions): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: brandYellow,
          backgroundImage:
            "radial-gradient(rgba(32,32,32,0.16) 1.2px, transparent 1.2px)",
          backgroundSize: "28px 28px",
          padding: "72px 80px",
          color: brandDark,
          fontFamily: FONT_FAMILY,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <img src={brandIcon} width={38} height={68} alt="" />
          <img src={brandWordmark} height={27} width={206} alt="Buidl Now" />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 84,
              fontWeight: 700,
              lineHeight: 1.04,
              letterSpacing: "-0.03em",
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 27, fontWeight: 500 }}>
          buidlnow.com
        </div>
      </div>
    ),
    {
      ...ogImageSize,
      fonts: [
        { name: FONT_FAMILY, data: fontData, weight: 400, style: "normal" },
        { name: FONT_FAMILY, data: fontData, weight: 700, style: "normal" },
      ],
    },
  );
}

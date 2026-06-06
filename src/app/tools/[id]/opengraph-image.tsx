import { ImageResponse } from "next/og";
import { tools } from "@/lib/tools-list";
import { getToolCategoryLabel } from "@/lib/seo";

export const alt = "Buidl Now developer tool";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const brandYellow = "#f0fb29";
const brandDark = "#202020";

interface OpenGraphImageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return tools.map((tool) => ({
    id: tool.id,
  }));
}

export default async function OpenGraphImage({ params }: OpenGraphImageProps) {
  const { id } = await params;
  const tool = tools.find((item) => item.id === id);

  const toolName = tool?.name ?? "Buidl Now";
  const categoryLabel = tool ? getToolCategoryLabel(tool.category) : "Developer Tools";

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
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 30,
            fontWeight: 600,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
          }}
        >
          Buidl Now
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              backgroundColor: brandDark,
              color: brandYellow,
              fontSize: 24,
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              padding: "10px 20px",
              marginBottom: 28,
            }}
          >
            {categoryLabel}
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 96,
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
              maxWidth: 980,
            }}
          >
            {toolName}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 28,
            fontWeight: 500,
          }}
        >
          <span>Free developer and Web3 tools</span>
          <span style={{ letterSpacing: "0.04em" }}>buidlnow.com</span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}

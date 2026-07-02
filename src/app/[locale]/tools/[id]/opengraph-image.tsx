import { tools } from "@/lib/tools-list";
import { createOgImage, ogImageSize, ogContentType } from "@/lib/og";

export const alt = "Buidl Now developer tool";
export const size = ogImageSize;
export const contentType = ogContentType;

export async function generateStaticParams() {
  return tools.map((tool) => ({
    id: tool.id,
  }));
}

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tool = tools.find((item) => item.id === id);
  return createOgImage({ title: tool?.name ?? "Buidl Now" });
}

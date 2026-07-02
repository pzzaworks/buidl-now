import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ToolStructuredData } from "@/components/structured-data";
import { HomePageClient } from "@/app/[locale]/page";
import { tools } from "@/lib/tools-list";

export default async function ToolPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const tool = tools.find((item) => item.id === id);

  if (!tool) {
    notFound();
  }

  // Localized strings for the JSON-LD so structured data matches the page
  // language (search engines read the ld+json, so it should not stay English).
  const tMeta = await getTranslations({ locale, namespace: "toolMeta" });
  const tCat = await getTranslations({ locale, namespace: "categories" });
  const tHome = await getTranslations({ locale, namespace: "home" });
  const name = tMeta.has(`${id}.name`) ? tMeta(`${id}.name`) : tool.name;
  const description = tMeta.has(`${id}.description`)
    ? tMeta(`${id}.description`)
    : tool.description;

  return (
    <>
      <ToolStructuredData
        tool={tool}
        locale={locale}
        name={name}
        description={description}
        categoryLabel={tCat(tool.category)}
        homeLabel={tHome("breadcrumbHome")}
      />
      <HomePageClient
        includeSiteStructuredData={false}
        initialSelectedToolId={id}
        routeMode="tool"
      />
    </>
  );
}

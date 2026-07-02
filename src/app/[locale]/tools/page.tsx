import { redirect } from "@/i18n/navigation";

export default async function AllToolsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect({ href: "/#tools", locale });
}

import { redirect } from "next/navigation";

export default async function PortalPage({ searchParams }: { searchParams: Promise<any> }) {
  const resolvedParams = await searchParams;
  const paramsString = new URLSearchParams(resolvedParams || {}).toString();
  redirect(`/textbooks/portal/login${paramsString ? `?${paramsString}` : ""}`);
}

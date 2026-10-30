import { redirect } from "next/navigation";
import { getAuthenticatedAdmin } from "@/lib/quotationAuth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    redirect("/quotation/admin/login/");
  }
  redirect("/quotation/admin/dashboard/");
}

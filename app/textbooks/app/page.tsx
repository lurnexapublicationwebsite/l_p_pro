"use client";

import { use } from "react";
import TextbookPortal from "../portal/TextbookPortal";

// The installable reading app — login/signup + the book/caselet library only. Reuses the
// exact same portal component, auth, and secure reader as the full site (appMode just hides
// the marketing chrome and the admin/faculty tooling that has no place in a reading app).
export default function TextbookAppPage({ searchParams }: { searchParams: Promise<any> }) {
  const resolvedParams = use(searchParams);
  const view = resolvedParams?.view || "";

  return <TextbookPortal appMode={true} initialView={view} />;
}

"use client";

import { use } from "react";
import TextbookPortal from "../TextbookPortal";

export default function SignupPage({ searchParams }: { searchParams: Promise<any> }) {
  const resolvedParams = use(searchParams);
  const view = resolvedParams?.view || "";
  const quizCode = resolvedParams?.quizCode || "";

  return <TextbookPortal defaultSignup={true} initialView={view} initialQuizCode={quizCode} />;
}

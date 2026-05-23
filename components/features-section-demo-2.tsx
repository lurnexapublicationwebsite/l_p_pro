"use client";

import { cn } from "@/lib/utils";
import {
  Globe2,
  BookOpen,
  Users,
  Cpu,
  Sparkles,
  Lightbulb,
  BarChart3,
} from "lucide-react";

export default function FeaturesSectionDemo() {
  const features = [
    {
      title: "Quality & Innovation in Publishing",
      description:
        "Each publication embodies precision, managerial insight, and academic excellence through rigorous peer review.",
      icon: <Lightbulb className="w-6 h-6" />,
    },
    {
      title: "Global Accessibility",
      description:
        "Make techno-management research available to scholars, institutions, and professionals worldwide.",
      icon: <Globe2 className="w-6 h-6" />,
    },
    {
      title: "Collaborative Research & Networking",
      description:
        "Foster partnerships with universities, industries, and researchers to drive innovation and shared learning.",
      icon: <Users className="w-6 h-6" />,
    },
    {
      title: "Knowledge Dissemination",
      description:
        "Promote leading-edge research in management, entrepreneurship, and innovation through global platforms.",
      icon: <BookOpen className="w-6 h-6" />,
    },
    {
      title: "Support for Emerging Talent",
      description:
        "Offer mentorship and affordable publishing opportunities for students and early-career researchers.",
      icon: <Sparkles className="w-6 h-6" />,
    },
    {
      title: "Digital Excellence in Publishing",
      description:
        "Utilize AI-driven tools and digital workflows for transparent and efficient publishing processes.",
      icon: <Cpu className="w-6 h-6" />,
    },
    {
      title: "Sustainable Growth & Credibility",
      description:
        "Build Lurnexa into a trusted global brand through innovation, quality, and academic leadership.",
      icon: <BarChart3 className="w-6 h-6" />,
    },
    {
      title: "Empowering Knowledge for the Future",
      description:
        "Drive a research ecosystem that transforms ideas into impact across technology, management, and society.",
      icon: <Lightbulb className="w-6 h-6" />,
    },
  ];

  return (
    <section className="relative z-10 py-16 bg-[#FFF0E6]">
      {/* ==== Heading Section ==== */}
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl text-dark">
              Core Objectives
            </h2>
            <p className="mt-2 text-sm text-black-600 max-w-lg">
              The pillars that drive Lurnexa&apos;s techno-management publishing
              ecosystem.
            </p>
          </div>
          <span className="rounded-full  px-4 py-1 text-xs font-semibold uppercase tracking-wide text-grey-700 bg-sky-500/15 ">
            8 Key Focus Areas
          </span>
        </div>
      </div>

      {/* ==== Features Grid ==== */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
        {features.map((feature, index) => (
          <Feature key={feature.title} {...feature} index={index} />
        ))}
      </div>
    </section>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r py-10 relative group/feature dark:border-neutral-800 bg-[#FFF0E6]",
        (index === 0 || index === 4) && "lg:border-l dark:border-neutral-800",
        index < 4 && "lg:border-b dark:border-neutral-800"
      )}
    >
      {/* Hover Gradients */}
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full  pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full  pointer-events-none" />
      )}

      {/* Icon */}
      <div className="mb-4 relative z-10 px-10 text-sky-500 dark:text-sky-300">
        {icon}
      </div>

      {/* Title */}
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-sky-500 transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-dark">
          {title}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-dark max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};

"use client"

import { motion, MotionProps } from "motion/react"

import { cn } from "@/lib/utils"

interface LineShadowTextProps
  extends Omit<React.HTMLAttributes<HTMLElement>, keyof MotionProps>,
    MotionProps {
  shadowColor?: string
  as?: React.ElementType
}

export function LineShadowText({
  children,
  shadowColor = "black",
  className,
  as: Component = "span",
  ...props
}: LineShadowTextProps) {
  const MotionComponent = motion.create(Component)
  
  let content = "";
  if (typeof children === "string") {
    content = children;
  } else if (Array.isArray(children)) {
    content = children.map(c => typeof c === "string" ? c : (c?.toString() || "")).join("");
  } else if (children !== null && children !== undefined) {
    content = children.toString();
  }

  content = content.trim();

  return (
    <MotionComponent
      style={{ "--shadow-color": shadowColor } as React.CSSProperties}
      className={cn(
        "relative z-0 inline-flex",
        "after:absolute after:top-[0.04em] after:left-[0.04em] after:content-[attr(data-text)]",
        "after:bg-[linear-gradient(45deg,transparent_45%,var(--shadow-color)_45%,var(--shadow-color)_55%,transparent_0)]",
        "after:-z-10 after:bg-[length:0.06em_0.06em] after:bg-clip-text after:text-transparent",
        "after:animate-line-shadow",
        className
      )}
      data-text={content}
      {...props}
    >
      {content}
    </MotionComponent>
  )
}

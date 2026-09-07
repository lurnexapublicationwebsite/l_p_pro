"use client";

import React from "react";
import { Clock, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { RentalStatus, getRentalStatusColor, getRentalStatusLabel, getRentalTimeRemaining } from "@/lib/data/rentals";

interface RentalBadgeProps {
  status: RentalStatus;
  expiresAt?: string;
  className?: string;
}

export default function RentalBadge({ status, expiresAt, className = "" }: RentalBadgeProps) {
  const color = getRentalStatusColor(status, expiresAt);
  const label = getRentalStatusLabel(status, expiresAt);
  const remaining = expiresAt ? getRentalTimeRemaining(expiresAt) : null;

  let bgClass = "bg-slate-100 text-slate-700 border-slate-200";
  let Icon = Clock;

  if (color === "green") {
    bgClass = "bg-emerald-50 text-emerald-700 border-emerald-200/80";
    Icon = CheckCircle2;
  } else if (color === "amber") {
    bgClass = "bg-amber-50 text-amber-700 border-amber-200/80 animate-pulse";
    Icon = AlertTriangle;
  } else if (color === "red") {
    bgClass = "bg-red-50 text-red-700 border-red-200/80";
    Icon = XCircle;
  } else if (color === "blue") {
    bgClass = "bg-blue-50 text-blue-700 border-blue-200/80";
    Icon = CheckCircle2;
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold ${bgClass} ${className}`}>
      <Icon size={12} />
      <span>{label}</span>
      {remaining && !remaining.isExpired && (
        <span className="opacity-80 font-normal">({remaining.displayText})</span>
      )}
    </div>
  );
}

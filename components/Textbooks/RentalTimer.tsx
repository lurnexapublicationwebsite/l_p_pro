"use client";

import React, { useState, useEffect } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { getRentalTimeRemaining, TimeRemaining } from "@/lib/data/rentals";

interface RentalTimerProps {
  expiresAt: string;
  onExpire?: () => void;
  compact?: boolean;
}

export default function RentalTimer({ expiresAt, onExpire, compact = false }: RentalTimerProps) {
  const [time, setTime] = useState<TimeRemaining>(() => getRentalTimeRemaining(expiresAt));

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getRentalTimeRemaining(expiresAt);
      setTime(remaining);
      if (remaining.isExpired && onExpire) {
        onExpire();
      }
    }, 10000); // refresh every 10 sec

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  if (time.isExpired) {
    return (
      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
        <AlertTriangle size={12} />
        <span>Expired</span>
      </div>
    );
  }

  if (compact) {
    return (
      <span className={`text-xs font-bold ${time.isUrgent ? 'text-red-600 animate-pulse' : (time.isExpiringSoon ? 'text-amber-600' : 'text-slate-700')}`}>
        {time.displayText}
      </span>
    );
  }

  return (
    <div className={`p-3 rounded-xl border flex items-center justify-between ${
      time.isUrgent 
        ? "bg-red-50 border-red-200 text-red-700 animate-pulse" 
        : time.isExpiringSoon 
          ? "bg-amber-50 border-amber-200 text-amber-800" 
          : "bg-slate-50 border-slate-200 text-slate-700"
    }`}>
      <div className="flex items-center gap-2">
        <Clock size={16} className={time.isUrgent ? "text-red-600" : time.isExpiringSoon ? "text-amber-600" : "text-indigo-600"} />
        <span className="text-xs font-bold">Rental Access Remaining:</span>
      </div>
      <span className="text-xs font-black tracking-wide font-mono">
        {time.displayText}
      </span>
    </div>
  );
}

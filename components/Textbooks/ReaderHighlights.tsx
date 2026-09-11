"use client";

import React, { useRef, useState } from "react";
import { Eraser, Highlighter, History, X } from "lucide-react";
import { HIGHLIGHT_COLORS, HighlightColor, HighlightRect } from "@/lib/readingProgress";

// Defined at module scope, not inside TextbookPortal: a component declared inside another
// component's render body gets a new identity every render and remounts — which would wipe
// the imperatively drawn PDF canvas on every state change.

// A drag this short in both directions is a tap (used to remove a highlight), not a stroke.
const TAP_THRESHOLD = 0.01;
// Dragging along a line of text leaves a near-zero-height box; give it one text line of height.
const LINE_BAND = 0.022;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

interface ReaderPageCanvasProps {
  highlights: HighlightRect[];
  highlightMode: boolean;
  highlightColor: HighlightColor;
  onAddHighlight: (rect: Omit<HighlightRect, "id">) => void;
  onRemoveHighlight: (id: string) => void;
  flipAnimClass: string;
}

// The secure PDF canvas plus a transparent layer on top that draws and shows marker-style
// highlights. The page itself stays non-selectable, so copy protection is unchanged.
export function ReaderPageCanvas({
  highlights,
  highlightMode,
  highlightColor,
  onAddHighlight,
  onRemoveHighlight,
  flipAnimClass,
}: ReaderPageCanvasProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const draftRef = useRef<{ x0: number; y0: number; x1: number; y1: number; pointerId: number } | null>(null);
  const [draft, setDraft] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(null);

  const toNormalized = (e: React.PointerEvent) => {
    const rect = overlayRef.current!.getBoundingClientRect();
    return {
      x: clamp01((e.clientX - rect.left) / rect.width),
      y: clamp01((e.clientY - rect.top) / rect.height),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!highlightMode || !overlayRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    try {
      overlayRef.current.setPointerCapture(e.pointerId);
    } catch {}
    const p = toNormalized(e);
    draftRef.current = { x0: p.x, y0: p.y, x1: p.x, y1: p.y, pointerId: e.pointerId };
    setDraft({ x0: p.x, y0: p.y, x1: p.x, y1: p.y });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const current = draftRef.current;
    if (!current || current.pointerId !== e.pointerId) return;
    e.preventDefault();
    const p = toNormalized(e);
    draftRef.current = { ...current, x1: p.x, y1: p.y };
    setDraft({ x0: current.x0, y0: current.y0, x1: p.x, y1: p.y });
  };

  const finishStroke = (e: React.PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const current = draftRef.current;
    if (!current || current.pointerId !== e.pointerId) return;
    draftRef.current = null;
    setDraft(null);
    try {
      overlayRef.current?.releasePointerCapture(e.pointerId);
    } catch {}
    if (cancelled) return;

    const x = Math.min(current.x0, current.x1);
    const w = Math.abs(current.x1 - current.x0);
    let y = Math.min(current.y0, current.y1);
    let h = Math.abs(current.y1 - current.y0);

    if (w < TAP_THRESHOLD && h < TAP_THRESHOLD) {
      // Tap: remove the most recently drawn highlight under the finger/cursor, if any.
      const hit = [...highlights].reverse().find(
        (hl) => current.x0 >= hl.x && current.x0 <= hl.x + hl.w && current.y0 >= hl.y && current.y0 <= hl.y + hl.h
      );
      if (hit) onRemoveHighlight(hit.id);
      return;
    }
    if (w < TAP_THRESHOLD) return;

    if (h < LINE_BAND) {
      const centerY = (current.y0 + current.y1) / 2;
      h = LINE_BAND;
      y = clamp01(centerY - LINE_BAND / 2);
      if (y + h > 1) y = 1 - h;
    }
    onAddHighlight({ x, y, w: Math.min(w, 1 - x), h: Math.min(h, 1 - y), c: highlightColor });
  };

  const draftBox = draft
    ? (() => {
        const x = Math.min(draft.x0, draft.x1);
        const w = Math.abs(draft.x1 - draft.x0);
        let y = Math.min(draft.y0, draft.y1);
        let h = Math.abs(draft.y1 - draft.y0);
        if (h < LINE_BAND) {
          y = clamp01((draft.y0 + draft.y1) / 2 - LINE_BAND / 2);
          h = LINE_BAND;
        }
        return { x, y, w, h };
      })()
    : null;

  return (
    <div className={`relative shrink-0 ${flipAnimClass}`}>
      <canvas
        id="secure-reader-canvas"
        className="block bg-white shadow-2xl rounded-2xl border border-slate-800 select-none pointer-events-none transition-all duration-300"
        style={{ userSelect: "none" }}
      />
      <div
        ref={overlayRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={(e) => finishStroke(e, false)}
        onPointerCancel={(e) => finishStroke(e, true)}
        onContextMenu={(e) => e.preventDefault()}
        className={`absolute inset-0 rounded-2xl overflow-hidden select-none ${
          highlightMode ? "z-[60] cursor-crosshair" : "pointer-events-none"
        }`}
        style={{ touchAction: highlightMode ? "none" : "auto" }}
      >
        {highlights.map((hl) => (
          <div
            key={hl.id}
            className="absolute rounded-[3px]"
            style={{
              left: `${hl.x * 100}%`,
              top: `${hl.y * 100}%`,
              width: `${hl.w * 100}%`,
              height: `${hl.h * 100}%`,
              background: HIGHLIGHT_COLORS[hl.c]?.fill || HIGHLIGHT_COLORS.yellow.fill,
              mixBlendMode: "multiply",
            }}
          />
        ))}
        {draftBox && draftBox.w > 0 && (
          <div
            className="absolute rounded-[3px] ring-1 ring-slate-900/20"
            style={{
              left: `${draftBox.x * 100}%`,
              top: `${draftBox.y * 100}%`,
              width: `${draftBox.w * 100}%`,
              height: `${draftBox.h * 100}%`,
              background: HIGHLIGHT_COLORS[highlightColor].fill,
              mixBlendMode: "multiply",
            }}
          />
        )}
      </div>
    </div>
  );
}

interface ReaderHighlightToolbarProps {
  highlightMode: boolean;
  onToggle: () => void;
  highlightColor: HighlightColor;
  onColorChange: (color: HighlightColor) => void;
  pageHighlightCount: number;
  onClearPage: () => void;
  disabled?: boolean;
}

export function ReaderHighlightToolbar({
  highlightMode,
  onToggle,
  highlightColor,
  onColorChange,
  pageHighlightCount,
  onClearPage,
  disabled,
}: ReaderHighlightToolbarProps) {
  return (
    <div className="flex items-center gap-1 bg-slate-950/60 px-1.5 py-1 md:px-2 md:py-1.5 rounded-xl md:rounded-2xl border border-slate-800">
      <button
        type="button"
        disabled={disabled}
        onClick={onToggle}
        className={`flex items-center gap-1.5 px-2 py-1 md:px-2.5 rounded-lg text-[11px] md:text-xs font-bold transition cursor-pointer disabled:opacity-40 ${
          highlightMode ? "bg-amber-400 text-slate-900 hover:bg-amber-300" : "text-slate-300 hover:text-white hover:bg-slate-800"
        }`}
        title={highlightMode ? "Stop highlighting" : "Highlight text on this page"}
        aria-pressed={highlightMode}
      >
        <Highlighter size={14} />
        <span className="hidden sm:inline">{highlightMode ? "Done" : "Highlight"}</span>
      </button>

      {highlightMode && (
        <>
          <div className="flex items-center gap-1 px-1">
            {(Object.keys(HIGHLIGHT_COLORS) as HighlightColor[]).map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => onColorChange(color)}
                className={`h-5 w-5 rounded-full border-2 transition ${
                  highlightColor === color ? "border-white scale-110" : "border-transparent opacity-80 hover:opacity-100"
                }`}
                style={{ background: HIGHLIGHT_COLORS[color].swatch }}
                title={`${HIGHLIGHT_COLORS[color].label} highlighter`}
                aria-label={`${HIGHLIGHT_COLORS[color].label} highlighter`}
              />
            ))}
          </div>
          <button
            type="button"
            disabled={pageHighlightCount === 0}
            onClick={onClearPage}
            className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 rounded-lg transition cursor-pointer"
            title="Clear all highlights on this page"
            aria-label="Clear all highlights on this page"
          >
            <Eraser size={14} />
          </button>
        </>
      )}
    </div>
  );
}

export function ReaderHighlightHint() {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[70] pointer-events-none bg-slate-900/90 text-white text-[11px] md:text-xs font-semibold px-3 py-1.5 rounded-full shadow-xl border border-slate-700 whitespace-nowrap">
      Drag across text to highlight · Tap a highlight to remove it
    </div>
  );
}

interface ReaderResumeNoticeProps {
  page: number;
  onStartOver: () => void;
  onDismiss: () => void;
}

export function ReaderResumeNotice({ page, onStartOver, onDismiss }: ReaderResumeNoticeProps) {
  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-2 bg-slate-900/95 text-white pl-3 pr-1.5 py-1.5 rounded-full shadow-2xl border border-slate-700 animate-fadeIn">
      <History size={14} className="text-fuchsia-400 shrink-0" />
      <span className="text-[11px] md:text-xs font-semibold whitespace-nowrap">Continued from page {page}</span>
      <button
        type="button"
        onClick={onStartOver}
        className="text-[11px] md:text-xs font-bold text-fuchsia-300 hover:text-white px-2 py-0.5 rounded-full hover:bg-slate-800 transition whitespace-nowrap"
      >
        Start from page 1
      </button>
      <button
        type="button"
        onClick={onDismiss}
        className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
        aria-label="Dismiss"
      >
        <X size={12} />
      </button>
    </div>
  );
}

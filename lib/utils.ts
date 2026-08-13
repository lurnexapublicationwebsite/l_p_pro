import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text || typeof window === "undefined") return false;

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    // Permission denied or Clipboard API failed, try fallback
  }

  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    textArea.setAttribute("readonly", "");
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    return false;
  }
}

export function safeClearClipboard(): void {
  try {
    if (typeof window !== "undefined" && navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText("").catch(() => {});
    }
  } catch (err) {
    // Ignore permissions or clipboard errors silently
  }
}


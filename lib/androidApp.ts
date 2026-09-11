import { useEffect, useState } from "react";

// The Android build of the reading app: a Trusted Web Activity APK that opens /textbooks/app/
// on www.lurnexa.in full-screen. Served as a static file so "Get the App" on an Android phone
// downloads it directly. The buttons are only shown on Android — PCs, laptops and iPhones
// can't install an APK.
export const ANDROID_APK_URL = "/downloads/lurnexa-textbooks.apk";

export function isAndroidDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /android/i.test(navigator.userAgent || "");
}

// Resolved after mount rather than during render, so server-rendered pages don't hydrate with
// a mismatched button (the server has no user agent to check).
export function useIsAndroidDevice(): boolean {
  const [isAndroid, setIsAndroid] = useState(false);
  useEffect(() => {
    setIsAndroid(isAndroidDevice());
  }, []);
  return isAndroid;
}

export function downloadAndroidApk(): void {
  const link = document.createElement("a");
  link.href = ANDROID_APK_URL;
  link.download = "lurnexa-textbooks.apk";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

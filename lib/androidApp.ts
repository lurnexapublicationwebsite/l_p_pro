// The Android build of the reading app: a Trusted Web Activity APK that opens /textbooks/app/
// on www.lurnexa.in full-screen. Served as a static file so "Install" on an Android phone can
// download it directly; iOS and desktop keep using the PWA install flow instead.
export const ANDROID_APK_URL = "/downloads/lurnexa-textbooks.apk";

export function isAndroidDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /android/i.test(navigator.userAgent || "");
}

export function downloadAndroidApk(): void {
  const link = document.createElement("a");
  link.href = ANDROID_APK_URL;
  link.download = "lurnexa-textbooks.apk";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

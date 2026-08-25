/** Guest free-tier limits (client). Signed-in users are unlimited here. */

export const GUEST_FREE_GENERATIONS = 2;
export const GUEST_USAGE_STORAGE_KEY = "truthlens_guest_generations";
export const GUEST_USAGE_COOKIE = "tl_guest_gens";

export function readGuestUsage(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(GUEST_USAGE_STORAGE_KEY);
    const n = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

export function writeGuestUsage(count: number): void {
  if (typeof window === "undefined") return;
  const next = Math.max(0, Math.floor(count));
  try {
    localStorage.setItem(GUEST_USAGE_STORAGE_KEY, String(next));
    document.cookie = `${GUEST_USAGE_COOKIE}=${next}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`;
  } catch {
    /* ignore */
  }
}

export function incrementGuestUsage(): number {
  const next = readGuestUsage() + 1;
  writeGuestUsage(next);
  return next;
}

export function guestCreditsRemaining(): number {
  return Math.max(0, GUEST_FREE_GENERATIONS - readGuestUsage());
}

export function isGuestLimitReached(): boolean {
  return readGuestUsage() >= GUEST_FREE_GENERATIONS;
}

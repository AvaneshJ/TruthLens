import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "./auth";
import {
  GUEST_FREE_GENERATIONS,
  GUEST_USAGE_COOKIE,
} from "./guestCredits";

export type GuestGateResult =
  | { ok: true; isGuest: boolean; usage: number }
  | { ok: false; response: NextResponse };

function parseUsage(raw: string | undefined): number {
  const n = raw ? parseInt(raw, 10) : 0;
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Block anonymous callers who already used free generations. */
export async function enforceGuestCredits(): Promise<GuestGateResult> {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    return { ok: true, isGuest: false, usage: 0 };
  }

  const jar = await cookies();
  const usage = parseUsage(jar.get(GUEST_USAGE_COOKIE)?.value);
  if (usage >= GUEST_FREE_GENERATIONS) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          status: "FAIL",
          code: "GUEST_LIMIT",
          summary:
            "Free guest credits are used up. Log in or sign up to continue verifying claims.",
        },
        { status: 402 },
      ),
    };
  }

  return { ok: true, isGuest: true, usage };
}

/** Bump guest cookie after a generation is accepted. */
export async function bumpGuestCreditsCookie(
  response: NextResponse,
  currentUsage: number,
): Promise<NextResponse> {
  const next = currentUsage + 1;
  response.cookies.set(GUEST_USAGE_COOKIE, String(next), {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    httpOnly: false,
  });
  return response;
}

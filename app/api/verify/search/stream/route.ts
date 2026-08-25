import { NextRequest, NextResponse } from "next/server";
import {
  bumpGuestCreditsCookie,
  enforceGuestCredits,
} from "@/lib/guestCreditsServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://fair-gpt-backend.onrender.com";

const MAX_QUERY_LEN = 500;
const MAX_CONTEXT_LEN = 1800;

function sseFail(summary: string, status = 400) {
  return new NextResponse(
    `data: ${JSON.stringify({
      event: "result",
      data: { status: "FAIL", code: status === 402 ? "GUEST_LIMIT" : undefined, summary },
    })}\n\n`,
    {
      status,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    }
  );
}

export async function POST(req: NextRequest) {
  const gate = await enforceGuestCredits();
  if (!gate.ok) {
    return sseFail(
      "Free guest credits are used up. Log in or sign up to continue verifying claims.",
      402
    );
  }

  const apiKey = process.env.BACKEND_API_KEY;
  if (!apiKey) {
    return sseFail("Verification service is not configured.", 503);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return sseFail("Invalid JSON body.");
  }

  const query = typeof body?.query === "string" ? body.query.trim() : "";
  const language =
    typeof body?.language === "string" ? body.language.slice(0, 64) : "English";
  const context =
    typeof body?.context === "string"
      ? body.context.trim().slice(0, MAX_CONTEXT_LEN)
      : "";

  if (!query) return sseFail("Query cannot be empty.");
  if (query.length > MAX_QUERY_LEN) {
    return sseFail(`Query must be ${MAX_QUERY_LEN} characters or fewer.`);
  }

  try {
    const upstream = await fetch(
      `${BACKEND_URL.replace(/\/$/, "")}/api/search/stream`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
          Accept: "text/event-stream",
        },
        body: JSON.stringify({ query, language, context }),
        signal: AbortSignal.timeout(120000),
      }
    );

    if (!upstream.ok || !upstream.body) {
      const text = await upstream.text().catch(() => "");
      let summary = "Verification engine returned an error.";
      try {
        const parsed = JSON.parse(text);
        summary = parsed.detail || parsed.summary || summary;
      } catch {
        /* ignore */
      }
      return sseFail(summary, upstream.status || 502);
    }

    const res = new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
    if (gate.isGuest) {
      await bumpGuestCreditsCookie(res, gate.usage);
    }
    return res;
  } catch (error: unknown) {
    const name = error instanceof Error ? error.name : "";
    const summary =
      name === "TimeoutError" || name === "AbortError"
        ? "Verification timed out. Please try again."
        : "Could not reach the verification engine. Please try again.";
    return sseFail(
      summary,
      name === "TimeoutError" || name === "AbortError" ? 504 : 502
    );
  }
}

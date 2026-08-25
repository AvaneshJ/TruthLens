import { NextRequest, NextResponse } from "next/server";
import {
  bumpGuestCreditsCookie,
  enforceGuestCredits,
} from "@/lib/guestCreditsServer";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://fair-gpt-backend.onrender.com";

const MAX_QUERY_LEN = 500;

export async function POST(req: NextRequest) {
  try {
    const gate = await enforceGuestCredits();
    if (!gate.ok) return gate.response;

    const apiKey = process.env.BACKEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { status: "FAIL", summary: "Verification service is not configured." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const query = typeof body?.query === "string" ? body.query.trim() : "";
    const language =
      typeof body?.language === "string" ? body.language.slice(0, 64) : "English";
    const context =
      typeof body?.context === "string" ? body.context.trim().slice(0, 1800) : "";

    if (!query) {
      return NextResponse.json(
        { status: "FAIL", summary: "Query cannot be empty." },
        { status: 400 }
      );
    }
    if (query.length > MAX_QUERY_LEN) {
      return NextResponse.json(
        {
          status: "FAIL",
          summary: `Query must be ${MAX_QUERY_LEN} characters or fewer.`,
        },
        { status: 400 }
      );
    }

    const upstream = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/api/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({ query, language, context }),
      signal: AbortSignal.timeout(90000),
    });

    const text = await upstream.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = {
        status: "FAIL",
        summary: "Verification engine returned an invalid response.",
      };
    }

    const res = NextResponse.json(data, { status: upstream.status });
    if (gate.isGuest && upstream.ok) {
      await bumpGuestCreditsCookie(res, gate.usage);
    }
    return res;
  } catch (error: unknown) {
    const name = error instanceof Error ? error.name : "";
    if (name === "TimeoutError" || name === "AbortError") {
      return NextResponse.json(
        { status: "FAIL", summary: "Verification timed out. Please try again." },
        { status: 504 }
      );
    }
    console.error("Verify search proxy error:", error);
    return NextResponse.json(
      {
        status: "FAIL",
        summary: "Could not reach the verification engine. Please try again.",
      },
      { status: 502 }
    );
  }
}

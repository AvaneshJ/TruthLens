import { NextRequest, NextResponse } from "next/server";
import {
  bumpGuestCreditsCookie,
  enforceGuestCredits,
} from "@/lib/guestCreditsServer";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://fair-gpt-backend.onrender.com";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

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

    const incoming = await req.formData();
    const file = incoming.get("file");
    const query = incoming.get("query");
    const language = incoming.get("language");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { status: "FAIL", summary: "An image file is required." },
        { status: 400 }
      );
    }

    const contentType = (file.type || "").toLowerCase().split(";")[0].trim();
    if (!ALLOWED_TYPES.has(contentType)) {
      return NextResponse.json(
        {
          status: "FAIL",
          summary: "Unsupported file type. Upload a JPEG, PNG, WebP, or GIF.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { status: "FAIL", summary: "Image must be 5MB or smaller." },
        { status: 400 }
      );
    }

    const formData = new FormData();
    formData.append("file", file, file.name || "upload.jpg");
    if (typeof query === "string" && query.trim()) {
      formData.append("query", query.trim().slice(0, 500));
    }
    formData.append(
      "language",
      typeof language === "string" && language.trim()
        ? language.trim().slice(0, 64)
        : "English"
    );

    const upstream = await fetch(
      `${BACKEND_URL.replace(/\/$/, "")}/api/verify-media`,
      {
        method: "POST",
        headers: {
          "X-API-Key": apiKey,
        },
        body: formData,
        signal: AbortSignal.timeout(90000),
      }
    );

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
        {
          status: "FAIL",
          summary: "Media verification timed out. Please try again.",
        },
        { status: 504 }
      );
    }
    console.error("Verify media proxy error:", error);
    return NextResponse.json(
      {
        status: "FAIL",
        summary: "Could not reach the verification engine. Please try again.",
      },
      { status: 502 }
    );
  }
}

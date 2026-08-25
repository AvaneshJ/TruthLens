import { NextRequest, NextResponse } from "next/server";
import {
  bumpGuestCreditsCookie,
  enforceGuestCredits,
} from "@/lib/guestCreditsServer";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://fair-gpt-backend.onrender.com";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/m4a",
  "audio/wav",
  "audio/x-wav",
  "audio/webm",
  "audio/ogg",
  "audio/flac",
  "video/webm", // MediaRecorder often tags webm this way
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
        { status: "FAIL", summary: "An audio file is required." },
        { status: 400 }
      );
    }

    const contentType = (file.type || "").toLowerCase().split(";")[0].trim();
    if (contentType && !ALLOWED_TYPES.has(contentType)) {
      return NextResponse.json(
        {
          status: "FAIL",
          summary:
            "Unsupported audio type. Upload MP3, WAV, M4A, WEBM, OGG, or FLAC.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { status: "FAIL", summary: "Audio must be 10MB or smaller." },
        { status: 400 }
      );
    }

    const formData = new FormData();
    formData.append("file", file, file.name || "clip.webm");
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
      `${BACKEND_URL.replace(/\/$/, "")}/api/verify-audio`,
      {
        method: "POST",
        headers: { "X-API-Key": apiKey },
        body: formData,
        signal: AbortSignal.timeout(120000),
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
          summary: "Audio verification timed out. Please try again.",
        },
        { status: 504 }
      );
    }
    console.error("Verify audio proxy error:", error);
    return NextResponse.json(
      {
        status: "FAIL",
        summary: "Could not reach the verification engine. Please try again.",
      },
      { status: 502 }
    );
  }
}

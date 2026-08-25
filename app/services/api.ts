/**
 * @deprecated Dead client — use same-origin `/api/verify/search` and `/api/verify/media`.
 * Kept as a thin re-export so accidental imports do not hit wrong backend paths.
 */

export async function analyzeClaim(query: string, language = "English") {
  const res = await fetch("/api/verify/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, language }),
  });
  const data = await res.json().catch(() => ({
    status: "FAIL",
    summary: "Invalid response from verification service.",
  }));
  if (!res.ok && data?.status !== "FAIL") {
    throw new Error(data?.summary || data?.detail || `Server error ${res.status}`);
  }
  return data;
}

export async function verifyMedia(file: File, query?: string, language = "English") {
  const formData = new FormData();
  formData.append("file", file);
  if (query) formData.append("query", query);
  formData.append("language", language);
  const res = await fetch("/api/verify/media", {
    method: "POST",
    body: formData,
  });
  const data = await res.json().catch(() => ({
    status: "FAIL",
    summary: "Invalid response from verification service.",
  }));
  if (!res.ok && data?.status !== "FAIL") {
    throw new Error(data?.summary || data?.detail || `Server error ${res.status}`);
  }
  return data;
}

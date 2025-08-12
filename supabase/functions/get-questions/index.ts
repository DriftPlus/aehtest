// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const SHEET_ID = Deno.env.get("SHEET_ID")!;
const API_KEY = Deno.env.get("SHEETS_API_KEY")!;
const RANGE = Deno.env.get("SHEET_RANGE") || "Questions!A1:H1000";

function rowToObj(headers: string[], row: string[]) {
  const obj: Record<string, string> = {};
  headers.forEach((h, i) => (obj[h] = row[i] ?? ""));
  return obj;
}

function pickRandom<T>(arr: T[], n: number) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const lang = url.searchParams.get("lang")?.toLowerCase() || "en";
    const testName = url.searchParams.get("test") || "";
    const count = Math.min(parseInt(url.searchParams.get("count") || "10", 10), 10);

    const sheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(RANGE)}?key=${API_KEY}`;
    const res = await fetch(sheetsUrl);
    if (!res.ok) throw new Error(`Sheets fetch failed: ${res.status}`);

    const data = await res.json();
    const values: string[][] = data.values || [];
    if (values.length < 2) return new Response(JSON.stringify({ questions: [] }), { headers: { "content-type": "application/json" } });

    const headers = values[0];
    const rows = values.slice(1).map((r) => rowToObj(headers, r));

    const filtered = rows.filter((r) =>
      (String(r.Active).toLowerCase() === "true") &&
      (String(r.Language).toLowerCase() === lang) &&
      (!testName || (r["Test Name"] || "") === testName)
    );

    const picked = pickRandom(filtered, Math.max(5, count));

    const questions = picked.map((r, idx) => ({
      id: idx + 1,
      question: r.Question,
      options: [r["Option A"], r["Option B"], r["Option C"]].filter(Boolean),
      correct: (r["Correct Answer"] || "A").toString().trim().toUpperCase(),
      language: r.Language,
      testName: r["Test Name"] || "",
    }));

    return new Response(JSON.stringify({ questions }), { headers: { "content-type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { "content-type": "application/json" } });
  }
});

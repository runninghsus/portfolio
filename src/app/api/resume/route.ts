import { NextRequest } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Serves the résumé from outside /public, behind a Cloudflare Turnstile check when
 * TURNSTILE_SECRET_KEY is set (keeps the PDF — and the email in it — away from scrapers).
 * Without the secret configured it simply serves the file, so the site works before setup.
 */
const FILE = path.join(process.cwd(), "private", "resume.pdf");
const DOWNLOAD_NAME = "Alexander_Hsu_Resume.pdf";

const memory = new Map<string, { n: number; t: number }>();
function allows(ip: string, limit = 12, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const rec = memory.get(ip);
  if (!rec || now - rec.t > windowMs) {
    memory.set(ip, { n: 1, t: now });
    return true;
  }
  rec.n += 1;
  return rec.n <= limit;
}

async function verify(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // not configured: no gate
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token, remoteip: ip }),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

async function send(ip: string, token: string) {
  if (!allows(ip)) return new Response("Too many downloads from this address — please try again in a few minutes.", { status: 429 });
  if (!(await verify(token, ip))) return new Response("Verification failed. Please go back and try the download again.", { status: 403 });
  const pdf = await readFile(FILE);
  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${DOWNLOAD_NAME}"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}

const ipOf = (req: NextRequest) => req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";

/** The gated path: the Turnstile widget posts its token here. */
export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  const token = String(form?.get("cf-turnstile-response") ?? form?.get("token") ?? "");
  return send(ipOf(req), token);
}

/** Direct link: only works while no Turnstile secret is configured. */
export async function GET(req: NextRequest) {
  if (process.env.TURNSTILE_SECRET_KEY) {
    return new Response("The résumé is downloaded from the button on the site.", { status: 403, headers: { "X-Robots-Tag": "noindex" } });
  }
  return send(ipOf(req), "");
}

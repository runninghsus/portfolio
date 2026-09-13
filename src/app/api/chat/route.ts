import { NextRequest } from "next/server";
import { buildSystemPrompt } from "@/lib/chat-prompt";
import { createSSEParser } from "@/lib/sse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = process.env.CHAT_MODEL ?? "claude-haiku-4-5";
const MAX_TURNS = 8; // user+assistant messages kept per request
const MAX_CHARS = 600; // per user message
const MAX_TOKENS = 350; // per reply

type Msg = { role: "user" | "assistant"; content: string };

/* ---------- rate limiting ------------------------------------------------
 * Always: a best-effort in-memory limiter per function instance.
 * If Upstash Redis is configured (UPSTASH_REDIS_REST_URL/TOKEN), also a real
 * per-IP daily limit and a global daily cap shared across instances.
 * Set a hard spend limit in the Anthropic console as the final backstop.
 * ---------------------------------------------------------------------- */
const memory = new Map<string, { n: number; t: number }>();
function memoryAllows(ip: string, limit = 20, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const rec = memory.get(ip);
  if (!rec || now - rec.t > windowMs) {
    memory.set(ip, { n: 1, t: now });
    return true;
  }
  rec.n += 1;
  return rec.n <= limit;
}
async function redisAllows(ip: string): Promise<boolean> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return true;
  const day = new Date().toISOString().slice(0, 10);
  const perIp = Number(process.env.CHAT_DAILY_PER_IP ?? 40);
  const global = Number(process.env.CHAT_DAILY_GLOBAL ?? 1500);
  try {
    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify([
        ["INCR", `chat:${day}:${ip}`],
        ["EXPIRE", `chat:${day}:${ip}`, 90000],
        ["INCR", `chat:${day}:all`],
        ["EXPIRE", `chat:${day}:all`, 90000],
      ]),
    });
    const out = (await res.json()) as { result: number }[];
    return out[0].result <= perIp && out[2].result <= global;
  } catch {
    return true; // never let the limiter itself take the site down
  }
}

function streamText(text: string, status = 200) {
  const enc = new TextEncoder();
  return new Response(
    new ReadableStream({
      start(c) {
        c.enqueue(enc.encode(text));
        c.close();
      },
    }),
    { status, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } },
  );
}

const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g;
function clean(s: unknown): string {
  return String(s ?? "").replace(CONTROL, "").trim().slice(0, MAX_CHARS);
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (!memoryAllows(ip) || !(await redisAllows(ip))) {
    return streamText("That's a lot of questions in a short time — please try again in a few minutes, or message Alex on LinkedIn.", 429);
  }

  let messages: Msg[] = [];
  try {
    const body = (await req.json()) as { messages?: unknown };
    if (Array.isArray(body.messages)) {
      messages = body.messages
        .filter((m): m is { role: string; content: unknown } => !!m && typeof m === "object" && "role" in m)
        .map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: clean(m.content) }) as Msg)
        .filter((m) => m.content.length > 0)
        .slice(-MAX_TURNS);
    }
  } catch {
    /* fall through to validation below */
  }
  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return streamText("Ask me something about Alex's work.", 400);
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return streamText("The assistant isn't switched on yet — the site owner still needs to add an API key. In the meantime, everything it would say is on this page, and Alex is reachable on LinkedIn.");
  }

  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      temperature: 0.2,
      system: buildSystemPrompt(),
      messages,
      stream: true,
    }),
  });

  if (!upstream.ok || !upstream.body) {
    console.error("chat upstream error", upstream.status, await upstream.text().catch(() => ""));
    return streamText("The assistant is having trouble right now. Everything it would say is on this page, and Alex is reachable on LinkedIn.", 502);
  }

  const enc = new TextEncoder();
  const dec = new TextDecoder();
  const reader = upstream.body.getReader();
  const stream = new ReadableStream({
    async start(controller) {
      const parser = createSSEParser((t) => controller.enqueue(enc.encode(t)));
      try {
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          parser.push(dec.decode(value, { stream: true }));
        }
      } finally {
        controller.close();
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });
  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}

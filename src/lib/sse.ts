/** Pulls text deltas out of Anthropic's streaming (SSE) response. Pure, so it can be unit-tested. */
export function createSSEParser(onText: (t: string) => void) {
  let buffer = "";
  return {
    push(chunk: string) {
      buffer += chunk;
      let idx: number;
      while ((idx = buffer.indexOf("\n\n")) !== -1) {
        const event = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        for (const line of event.split("\n")) {
          if (!line.startsWith("data:")) continue;
          const raw = line.slice(5).trim();
          if (!raw || raw === "[DONE]") continue;
          try {
            const data = JSON.parse(raw) as { type?: string; delta?: { type?: string; text?: string } };
            if (data.type === "content_block_delta" && data.delta?.type === "text_delta" && data.delta.text) onText(data.delta.text);
          } catch {
            /* ignore partial or non-JSON lines */
          }
        }
      }
    },
  };
}

import { ultron } from "./bridge";

type Intent =
  | { kind: "open_app"; target: string }
  | { kind: "open_url"; url: string }
  | { kind: "unknown"; text: string };

export type UltronResult = {
  ok: boolean;
  message: string;
  intent: Intent;
};

const appAliases: Record<string, string> = {
  notepad: "notepad",
  calculator: "calculator",
  calc: "calculator",
  explorer: "explorer",
  "file explorer": "file explorer",
  cmd: "cmd",
  powershell: "powershell",
};

export function classify(text: string): Intent {
  const normalized = text.trim().toLowerCase();
  if (!normalized) return { kind: "unknown", text: normalized };

  for (const [phrase, target] of Object.entries(appAliases)) {
    if (normalized === `open ${phrase}` || normalized === `launch ${phrase}` || normalized === `start ${phrase}`) {
      return { kind: "open_app", target };
    }
  }

  const urlMatch = normalized.match(/\bhttps?:\/\/\S+/i);
  if (urlMatch) return { kind: "open_url", url: urlMatch[0] };

  return { kind: "unknown", text: text.trim() };
}

export async function execute(text: string): Promise<UltronResult> {
  const intent = classify(text);
  try {
    if (intent.kind === "open_app") {
      const message = await ultron.open(intent.target);
      return { ok: true, message, intent };
    }
    if (intent.kind === "open_url") {
      const message = await ultron.openUrl(intent.url);
      return { ok: true, message: `Opened ${message}`, intent };
    }
    return {
      ok: false,
      message: "I understood the request, but no safe action is registered for it yet.",
      intent,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : String(error),
      intent,
    };
  }
}

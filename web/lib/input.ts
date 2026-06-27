export const FORM_LIMITS = {
  maxFields: 40,
  maxFieldBytes: 4_000,
  maxTotalBytes: 20_000,
} as const;

export const REQUEST_LIMITS = {
  maxJsonBytes: 50_000,
  maxWebhookBytes: 1_000_000,
} as const;

export type SafeFormResult =
  | { ok: true; data: Record<string, string> }
  | { ok: false; error: string };

const encoder = new TextEncoder();
const controlCharsExceptWhitespace = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function sanitizeText(value: string) {
  return value.normalize("NFKC").replace(controlCharsExceptWhitespace, "").trim();
}

export function formDataToSafeObject(
  formData: FormData,
  limits: Partial<typeof FORM_LIMITS> = {}
): SafeFormResult {
  const maxFields = limits.maxFields ?? FORM_LIMITS.maxFields;
  const maxFieldBytes = limits.maxFieldBytes ?? FORM_LIMITS.maxFieldBytes;
  const maxTotalBytes = limits.maxTotalBytes ?? FORM_LIMITS.maxTotalBytes;

  const data: Record<string, string> = {};
  let count = 0;
  let totalBytes = 0;

  for (const [rawKey, rawValue] of formData.entries()) {
    count += 1;
    if (count > maxFields) return { ok: false, error: "Too many form fields." };

    if (typeof rawValue !== "string") {
      return { ok: false, error: "File uploads are not supported here." };
    }

    const key = sanitizeText(rawKey);
    const value = sanitizeText(rawValue);
    if (!key || key.length > 80) return { ok: false, error: "Malformed form field." };

    const fieldBytes = encoder.encode(value).byteLength;
    totalBytes += fieldBytes + encoder.encode(key).byteLength;
    if (fieldBytes > maxFieldBytes) return { ok: false, error: "A form field is too large." };
    if (totalBytes > maxTotalBytes) return { ok: false, error: "The submitted form is too large." };

    data[key] = value;
  }

  return { ok: true, data };
}

export function hasOversizedBody(req: Request, maxBytes: number) {
  const length = req.headers.get("content-length");
  if (!length) return false;
  const bytes = Number(length);
  return Number.isFinite(bytes) && bytes > maxBytes;
}

export async function readLimitedText(req: Request, maxBytes: number) {
  if (hasOversizedBody(req, maxBytes)) {
    return { ok: false as const, error: "Payload too large." };
  }

  const reader = req.body?.getReader();
  if (!reader) return { ok: true as const, text: "" };

  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel().catch(() => undefined);
      return { ok: false as const, error: "Payload too large." };
    }
    chunks.push(value);
  }

  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return { ok: true as const, text: new TextDecoder("utf-8", { fatal: false }).decode(body) };
}

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const PARADISE_URL = "https://multi.paradisepags.com/api/v1/transaction.php";

const inputSchema = z.object({
  amount: z.number().positive(), // BRL units (reais)
  description: z.string().min(1).max(255),
  reference: z.string().min(1).max(255),
  customer: z.object({
    name: z.string().min(1).max(255),
    email: z.string().email().max(255),
    phone: z.string().min(8).max(20),
    document: z.string().length(11),
  }),
});

const normalizeKey = (key: string) => key.toLowerCase().replace(/[^a-z0-9]/g, "");

const copyPasteKeys = new Set([
  "qrcode",
  "pixcode",
  "pixcopiacola",
  "copiacola",
  "copypaste",
  "emv",
  "brcode",
  "payload",
]);

const imageKeys = new Set([
  "qrcodebase64",
  "qrcodeimage",
  "qrcodeurl",
  "base64",
  "image",
]);

const isLikelyPixCode = (value: string) =>
  value.startsWith("000201") || value.includes("BR.GOV.BCB.PIX") || value.length > 80;

const isLikelyQrImage = (value: string) =>
  value.startsWith("data:image/") ||
  value.startsWith("http://") ||
  value.startsWith("https://") ||
  value.startsWith("iVBOR") ||
  value.startsWith("/9j/");

const findPixFields = (input: unknown) => {
  let qr_code: string | undefined;
  let qr_code_base64: string | undefined;

  const walk = (value: unknown, key = "") => {
    if (!value) return;
    if (typeof value === "string") {
      const text = value.trim();
      if (!text) return;
      const normalizedKey = normalizeKey(key);
      if (!qr_code_base64 && imageKeys.has(normalizedKey) && isLikelyQrImage(text)) qr_code_base64 = text;
      if (!qr_code && copyPasteKeys.has(normalizedKey) && !isLikelyQrImage(text) && isLikelyPixCode(text)) qr_code = text;
      if (!qr_code && !isLikelyQrImage(text) && isLikelyPixCode(text)) qr_code = text;
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item, index) => walk(item, `${key}_${index}`));
      return;
    }
    if (typeof value === "object") {
      Object.entries(value as Record<string, unknown>).forEach(([childKey, childValue]) => walk(childValue, childKey));
    }
  };

  walk(input);
  return { qr_code, qr_code_base64 };
};

export const createParadisePixTransaction = createServerFn({ method: "POST" })
  .inputValidator((data: z.infer<typeof inputSchema>) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.PARADISE_API_KEY;
    if (!apiKey) throw new Error("PARADISE_API_KEY não configurado");

    const payload = {
      amount: Math.round(data.amount * 100), // centavos
      description: data.description,
      reference: data.reference,
      source: "api_externa",
      customer: data.customer,
    };

    const res = await fetch(PARADISE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    const body = await res.json().catch(() => ({}));
    if (!res.ok || (body as any)?.status === "error") {
      console.error("[Paradise] erro", res.status, body);
      throw new Error(
        (body as { message?: string; error?: string }).message ??
          (body as { error?: string }).error ??
          `Paradise erro ${res.status}`,
      );
    }
    console.log("[Paradise] response keys:", Object.keys(body as any));

    // Paradise pode retornar campos no root, aninhados ou com nomes diferentes.
    const b: any = body;
    const nested = b?.data ?? b?.pix ?? b?.transaction ?? b?.response ?? {};
    const detected = findPixFields(b);
    const qr_code =
      b?.qr_code ?? b?.pix_code ?? b?.pix_copia_cola ?? b?.copy_paste ??
      nested?.qr_code ?? nested?.pix_code ?? nested?.pix_copia_cola ?? nested?.copy_paste ?? nested?.emv ?? detected.qr_code;
    const qr_code_base64 =
      b?.qr_code_base64 ?? b?.qr_code_image ?? b?.qrcode_image ?? b?.qr_code_url ??
      nested?.qr_code_base64 ?? nested?.qr_code_image ?? nested?.qrcode_image ?? nested?.qr_code_url ?? detected.qr_code_base64;

    return {
      qr_code: qr_code as string | undefined,
      qr_code_base64: qr_code_base64 as string | undefined,
      transaction_id: (b?.transaction_id ?? b?.id ?? nested?.transaction_id ?? nested?.id) as string | number | undefined,
      amount: (b?.amount ?? nested?.amount) as number | undefined,
      expires_at: (b?.expires_at ?? nested?.expires_at) as string | undefined,
      raw: JSON.stringify(b),
    };
  });



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
    return body as {
      status?: string;
      transaction_id?: number | string;
      id?: string;
      qr_code?: string;
      qr_code_base64?: string;
      amount?: number;
      expires_at?: string;
    };
  });

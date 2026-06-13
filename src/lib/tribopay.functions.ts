import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const TRIBOPAY_URL = "https://api.tribopay.com.br/api/public/cash/deposits/pix";

const inputSchema = z.object({
  amount: z.number().positive(),
  externalId: z.string().optional(),
  postbackUrl: z.string().url().optional(),
  payer: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    document: z.string().length(11),
    phone: z.object({ number: z.string().min(8) }).optional(),
  }),
});

export const createTribopayPixDeposit = createServerFn({ method: "POST" })
  .inputValidator((data: z.infer<typeof inputSchema>) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const token = process.env.TRIBOPAY_API_TOKEN;
    if (!token) throw new Error("TRIBOPAY_API_TOKEN não configurado");

    const payload = {
      amount: data.amount,
      externalId: data.externalId,
      postbackUrl: data.postbackUrl,
      method: "pix",
      transactionOrigin: "cashin",
      payer: data.payer,
    };

    const res = await fetch(TRIBOPAY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("[TriboPay] erro", res.status, body);
      throw new Error(
        (body as { message?: string }).message ?? `TriboPay erro ${res.status}`,
      );
    }
    return body;
  });

// Backwards-compatible alias (old name used by CheckoutDialog)
export const createTribopayTransaction = createTribopayPixDeposit;

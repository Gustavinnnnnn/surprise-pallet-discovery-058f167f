import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const TRIBOPAY_URL = "https://api.tribopay.com.br/api/public/v1/transactions";

const customerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone_number: z.string().min(8),
  document: z.string().min(11),
  street_name: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
});

const cartItemSchema = z.object({
  product_hash: z.string().optional(),
  title: z.string(),
  price: z.number().int().positive(),
  quantity: z.number().int().positive(),
  operation_type: z.number().default(1),
  tangible: z.boolean().default(false),
  cover: z.string().nullable().optional(),
});

const cardSchema = z.object({
  number: z.string(),
  holder_name: z.string(),
  exp_month: z.number().int().min(1).max(12),
  exp_year: z.number().int(),
  cvv: z.string(),
});

const inputSchema = z.object({
  amount: z.number().int().positive(),
  offer_hash: z.string(),
  payment_method: z.enum(["pix", "credit_card", "billet"]),
  customer: customerSchema,
  cart: z.array(cartItemSchema).min(1),
  card: cardSchema.optional(),
  installments: z.number().int().min(1).max(12).optional(),
  expire_in_days: z.number().int().optional(),
  postback_url: z.string().url().optional(),
  tracking: z
    .object({
      src: z.string().optional(),
      utm_source: z.string().optional(),
      utm_medium: z.string().optional(),
      utm_campaign: z.string().optional(),
      utm_term: z.string().optional(),
      utm_content: z.string().optional(),
    })
    .optional(),
});

export const createTribopayTransaction = createServerFn({ method: "POST" })
  .inputValidator((data: z.infer<typeof inputSchema>) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const token = process.env.TRIBOPAY_API_TOKEN;
    if (!token) throw new Error("TRIBOPAY_API_TOKEN não configurado");

    if (data.payment_method === "credit_card" && !data.card) {
      throw new Error("Dados do cartão são obrigatórios para credit_card");
    }

    const payload = {
      api_token: token,
      transaction_origin: "api",
      ...data,
      cart: data.cart.map((item) => ({
        offer_hash: data.offer_hash,
        ...item,
      })),
    };

    const res = await fetch(`${TRIBOPAY_URL}?api_token=${encodeURIComponent(token)}`, {
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

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/tribopay-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const payload = await request.json().catch(() => null);
        if (!payload) return new Response("invalid", { status: 400 });

        try {
          const { supabaseAdmin } = await import(
            "@/integrations/supabase/client.server"
          );

          const hash: string | undefined =
            payload.hash ?? payload.transaction?.hash ?? payload.id;
          const status: string | undefined =
            payload.status ?? payload.transaction?.status;
          const customer = payload.customer ?? payload.transaction?.customer ?? {};
          const amount: number =
            payload.amount ?? payload.transaction?.amount ?? 0;

          if (!hash) return new Response("ok");

          const statusMap: Record<string, string> = {
            paid: "pago",
            pending: "aguardando_pagamento",
            canceled: "cancelado",
            refunded: "cancelado",
          };

          const { data: existing } = await supabaseAdmin
            .from("orders")
            .select("id")
            .eq("tracking_code", hash)
            .maybeSingle();

          const row = {
            customer_name: customer.name ?? "Cliente TriboPay",
            customer_email: customer.email ?? null,
            customer_phone: customer.phone_number ?? null,
            pallet_name: payload.cart?.[0]?.title ?? "Pedido TriboPay",
            total_amount: amount / 100,
            status: statusMap[status ?? ""] ?? "novo",
            payment_method: payload.payment_method ?? null,
            tracking_code: hash,
          };

          if (existing) {
            await supabaseAdmin.from("orders").update(row).eq("id", existing.id);
          } else {
            await supabaseAdmin.from("orders").insert(row);
          }
        } catch (e) {
          console.error("[tribopay-webhook]", e);
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});

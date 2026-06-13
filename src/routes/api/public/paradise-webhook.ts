import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const webhookSchema = z.object({
  transaction_id: z.union([z.string(), z.number()]).optional(),
  external_id: z.string().optional(),
  reference: z.string().optional(),
  status: z.enum(["pending", "approved", "processing", "failed", "refunded", "chargeback"]),
  amount: z.number().optional(),
});

const statusMap: Record<string, string> = {
  pending: "pending",
  processing: "processing",
  approved: "paid",
  failed: "cancelled",
  refunded: "refunded",
  chargeback: "chargeback",
};

export const Route = createFileRoute("/api/public/paradise-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const raw = await request.json();
          const parsed = webhookSchema.safeParse(raw);
          if (!parsed.success) {
            return new Response(JSON.stringify({ error: "invalid payload" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }
          const { transaction_id, external_id, reference, status } = parsed.data;
          const ref = external_id || reference;
          const newStatus = statusMap[status] ?? status;

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

          if (ref) {
            await supabaseAdmin
              .from("orders")
              .update({ status: newStatus, updated_at: new Date().toISOString() })
              .eq("order_number", ref);
          }

          console.log("[Paradise webhook]", { ref, transaction_id, status, newStatus });
          return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (e: any) {
          console.error("[Paradise webhook] error", e?.message);
          return new Response(JSON.stringify({ error: e?.message || "error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});

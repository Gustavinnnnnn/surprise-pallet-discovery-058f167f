import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Package, DollarSign, ShoppingCart, Users, PlaySquare, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const { data: metrics } = useQuery({
    queryKey: ["admin-dashboard-metrics"],
    queryFn: async () => {
      const [pallets, orders, customers, videos, testimonials] = await Promise.all([
        supabase.from("pallets").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("orders").select("total_amount,status"),
        supabase.from("customers").select("id", { count: "exact", head: true }),
        supabase.from("site_videos").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("testimonials").select("id", { count: "exact", head: true }).eq("is_active", true),
      ]);
      if (pallets.error) throw pallets.error;
      if (orders.error) throw orders.error;
      if (customers.error) throw customers.error;
      if (videos.error) throw videos.error;
      if (testimonials.error) throw testimonials.error;
      const paid = (orders.data ?? []).filter((o) => ["pago", "em_separacao", "enviado", "entregue"].includes(o.status));
      return {
        revenue: paid.reduce((sum, order) => sum + Number(order.total_amount ?? 0), 0),
        orders: orders.data?.length ?? 0,
        customers: customers.count ?? 0,
        pallets: pallets.count ?? 0,
        videos: videos.count ?? 0,
        testimonials: testimonials.count ?? 0,
      };
    },
  });

  const stats = [
    { label: "Faturamento", value: money(metrics?.revenue ?? 0), icon: DollarSign },
    { label: "Pedidos", value: String(metrics?.orders ?? 0), icon: ShoppingCart },
    { label: "Clientes", value: String(metrics?.customers ?? 0), icon: Users },
    { label: "Pallets Ativos", value: String(metrics?.pallets ?? 0), icon: Package },
    { label: "Vídeos Ativos", value: String(metrics?.videos ?? 0), icon: PlaySquare },
    { label: "Depoimentos", value: String(metrics?.testimonials ?? 0), icon: MessageSquare },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "Montserrat, sans-serif" }}>
          Dashboard
        </h1>
        <p className="text-zinc-400 text-sm mt-1">Visão geral do seu negócio</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-4 bg-zinc-900 border-zinc-800 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-zinc-400">{s.label}</span>
                <Icon size={18} className="text-[#FF6B00]" />
              </div>
              <div className="text-xl md:text-2xl font-bold">{s.value}</div>
            </Card>
          );
        })}
      </div>

      <Card className="p-6 bg-zinc-900 border-zinc-800 text-white">
        <h2 className="font-semibold mb-2">Painel completo conectado</h2>
        <p className="text-sm text-zinc-400">
          Use o menu para configurar pallets, pedidos, clientes, vídeos, depoimentos, FAQ, banners, textos do site e relatórios.
        </p>
      </Card>
    </div>
  );
}

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

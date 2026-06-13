import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { DollarSign, Package, ShoppingCart, TrendingUp, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/reports")({
  component: ReportsAdmin,
});

function ReportsAdmin() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const [orders, customers, pallets] = await Promise.all([
        supabase.from("orders").select("total_amount,status,created_at"),
        supabase.from("customers").select("id", { count: "exact", head: true }),
        supabase.from("pallets").select("id", { count: "exact", head: true }).eq("is_active", true),
      ]);
      if (orders.error) throw orders.error;
      if (customers.error) throw customers.error;
      if (pallets.error) throw pallets.error;
      const orderRows = orders.data ?? [];
      const paidOrders = orderRows.filter((o) => ["pago", "em_separacao", "enviado", "entregue"].includes(o.status));
      const revenue = paidOrders.reduce((sum, order) => sum + Number(order.total_amount ?? 0), 0);
      return {
        orders: orderRows.length,
        paidOrders: paidOrders.length,
        revenue,
        customers: customers.count ?? 0,
        activePallets: pallets.count ?? 0,
      };
    },
  });

  const cards = [
    { label: "Faturamento confirmado", value: money(data?.revenue ?? 0), icon: DollarSign },
    { label: "Pedidos pagos", value: String(data?.paidOrders ?? 0), icon: TrendingUp },
    { label: "Pedidos totais", value: String(data?.orders ?? 0), icon: ShoppingCart },
    { label: "Clientes", value: String(data?.customers ?? 0), icon: Users },
    { label: "Pallets ativos", value: String(data?.activePallets ?? 0), icon: Package },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "Montserrat, sans-serif" }}>Relatórios</h1>
        <p className="text-zinc-400 text-sm mt-1">Resumo comercial do site</p>
      </div>
      {isLoading ? <p className="text-zinc-400">Carregando...</p> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.label} className="p-5 bg-zinc-900 border-zinc-800 text-white">
                <Icon className="text-[#FF6B00] mb-4" size={22} />
                <p className="text-xs text-zinc-400">{card.label}</p>
                <strong className="block mt-1 text-2xl">{card.value}</strong>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}
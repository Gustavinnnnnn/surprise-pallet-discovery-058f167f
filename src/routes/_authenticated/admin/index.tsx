import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Package, DollarSign, ShoppingCart, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const { data: pallets } = useQuery({
    queryKey: ["admin-pallets-count"],
    queryFn: async () => {
      const { count } = await supabase.from("pallets").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const stats = [
    { label: "Faturamento Hoje", value: "R$ 0,00", icon: DollarSign },
    { label: "Pedidos Hoje", value: "0", icon: ShoppingCart },
    { label: "Clientes", value: "0", icon: Users },
    { label: "Pallets Ativos", value: String(pallets ?? 0), icon: Package },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "Montserrat, sans-serif" }}>
          Dashboard
        </h1>
        <p className="text-zinc-400 text-sm mt-1">Visão geral do seu negócio</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
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
        <h2 className="font-semibold mb-2">Próximas fases</h2>
        <ul className="text-sm text-zinc-400 space-y-1 list-disc pl-5">
          <li>Pedidos + Clientes (após integrar checkout)</li>
          <li>Vídeos, Depoimentos, FAQ, Banners</li>
          <li>Configurações + Relatórios</li>
        </ul>
      </Card>
    </div>
  );
}

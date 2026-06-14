import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, HelpCircle, Image, LayoutDashboard, MessageSquare, Package, PlaySquare, Settings, ShoppingCart, LogOut, Menu, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", u.user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!data);
    })();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    toast.success("Sessão encerrada");
    navigate({ to: "/auth" });
  }

  if (isAdmin === null) {
    return <div className="min-h-screen flex items-center justify-center bg-[#121212] text-white">Carregando...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212] text-white px-4 text-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Acesso negado</h1>
          <p className="text-zinc-400 mb-4">Sua conta não tem permissão de administrador.</p>
          <Button onClick={handleLogout} className="bg-[#FF6B00] hover:bg-[#FF6B00]/90">Sair</Button>
        </div>
      </div>
    );
  }

  const nav = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/pallets", label: "Pallets", icon: Package },
    { to: "/admin/categories", label: "Categorias", icon: Package },
    { to: "/admin/orders", label: "Pedidos", icon: ShoppingCart },
    { to: "/admin/customers", label: "Clientes", icon: Users },
    { to: "/admin/videos", label: "Vídeos", icon: PlaySquare },
    { to: "/admin/testimonials", label: "Depoimentos", icon: MessageSquare },
    { to: "/admin/faq", label: "FAQ", icon: HelpCircle },
    { to: "/admin/banners", label: "Banners", icon: Image },
    { to: "/admin/settings", label: "Configurações", icon: Settings },
    { to: "/admin/reports", label: "Relatórios", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-[#121212] text-white flex">
      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-zinc-900 border-r border-zinc-800 transform transition-transform ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <span className="font-bold text-lg" style={{ fontFamily: "Montserrat, sans-serif" }}>
            <span className="text-[#FF6B00]">Pallets</span> Admin
          </span>
          <button className="md:hidden" onClick={() => setOpen(false)}><X size={20} /></button>
        </div>
        <nav className="p-3 space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${active ? "bg-[#FF6B00] text-white" : "text-zinc-300 hover:bg-zinc-800"}`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-zinc-300 hover:bg-zinc-800 mt-4"
          >
            <LogOut size={18} />
            Sair
          </button>
        </nav>
      </aside>

      {/* Backdrop mobile */}
      {open && <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden h-14 border-b border-zinc-800 bg-zinc-900 flex items-center px-4 gap-3">
          <button onClick={() => setOpen(true)}><Menu size={22} /></button>
          <span className="font-bold"><span className="text-[#FF6B00]">Pallets</span> Admin</span>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

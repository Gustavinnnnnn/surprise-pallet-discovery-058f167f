import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminCrudPage } from "@/components/admin/AdminCrudPage";

export const Route = createFileRoute("/_authenticated/admin/pallets")({
  component: PalletsAdmin,
});

function PalletsAdmin() {
  const { data: categories = [] } = useQuery({
    queryKey: ["admin-pallet-categories-options"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("pallet_categories")
        .select("id,name")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as { id: string; name: string }[];
    },
  });

  const categoryOptions = [
    { label: "— Sem categoria —", value: "" },
    ...categories.map((c) => ({ label: c.name, value: c.id })),
  ];
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  return (
    <AdminCrudPage
      table="pallets"
      title="Pallets"
      description="Gerencie os produtos do site"
      queryKey="admin-pallets"
      orderBy="sort_order"
      searchKeys={["name", "badge", "description"]}
      nameKey="name"
      emptyState="Nenhum pallet cadastrado. Clique em Novo para começar."
      initialValues={{ name: "", price: 0, description: "", min_boxes: 1, max_boxes: 1, image_url: "", badge: "", promo_text: "", sort_order: 0, is_active: true, tribopay_offer_hash: "", tribopay_product_hash: "", category_id: "" }}
      fields={[
        { key: "name", label: "Nome", required: true },
        { key: "category_id", label: "Categoria", type: "select", options: categoryOptions, span: "full" },
        { key: "price", label: "Preço (R$)", type: "number", required: true },
        { key: "min_boxes", label: "Mín. caixas", type: "number" },
        { key: "max_boxes", label: "Máx. caixas", type: "number" },
        { key: "description", label: "Descrição", type: "textarea", rows: 3, span: "full" },
        { key: "image_url", label: "Imagem do pallet", type: "image", span: "full" },
        { key: "badge", label: "Selo", placeholder: "MAIS VENDIDO" },
        { key: "promo_text", label: "Texto promo" },
        { key: "tribopay_offer_hash", label: "TriboPay Offer Hash (opcional)" },
        { key: "tribopay_product_hash", label: "TriboPay Product Hash (opcional)" },
        { key: "sort_order", label: "Ordem", type: "number" },
        { key: "is_active", label: "Status", type: "switch" },
      ]}
      columns={[
        { key: "name", label: "Pallet" },
        { key: "category_id", label: "Categoria", render: (r) => (r.category_id ? (categoryMap.get(String(r.category_id)) ?? "—") : "—") },
        { key: "price", label: "Preço", render: (r) => `R$ ${Number(r.price ?? 0).toFixed(2)}` },
        { key: "is_active", label: "Status", render: (r) => (r.is_active ? "Ativo" : "Inativo") },
      ]}
    />
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { AdminCrudPage } from "@/components/admin/AdminCrudPage";

export const Route = createFileRoute("/_authenticated/admin/pallets")({
  component: PalletsAdmin,
});

function PalletsAdmin() {
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
      initialValues={{ name: "", price: 0, description: "", min_boxes: 1, max_boxes: 1, image_url: "", badge: "", promo_text: "", sort_order: 0, is_active: true }}
      fields={[
        { key: "name", label: "Nome", required: true },
        { key: "price", label: "Preço (R$)", type: "number", required: true },
        { key: "min_boxes", label: "Mín. caixas", type: "number" },
        { key: "max_boxes", label: "Máx. caixas", type: "number" },
        { key: "description", label: "Descrição", type: "textarea", rows: 3, span: "full" },
        { key: "image_url", label: "Imagem do pallet", type: "image", span: "full" },
        { key: "badge", label: "Selo", placeholder: "MAIS VENDIDO" },
        { key: "promo_text", label: "Texto promo" },
        { key: "sort_order", label: "Ordem", type: "number" },
        { key: "is_active", label: "Status", type: "switch" },
      ]}
      columns={[
        { key: "name", label: "Pallet" },
        { key: "price", label: "Preço", render: (r) => `R$ ${Number(r.price ?? 0).toFixed(2)}` },
        { key: "min_boxes", label: "Caixas", render: (r) => `${r.min_boxes ?? 1}–${r.max_boxes ?? 1}` },
        { key: "is_active", label: "Status", render: (r) => (r.is_active ? "Ativo" : "Inativo") },
      ]}
    />
  );
}
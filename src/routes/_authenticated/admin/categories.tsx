import { createFileRoute } from "@tanstack/react-router";
import { AdminCrudPage } from "@/components/admin/AdminCrudPage";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  component: CategoriesAdmin,
});

function CategoriesAdmin() {
  return (
    <AdminCrudPage
      table="pallet_categories"
      title="Categorias"
      description="Crie categorias / marcas (Mercado Livre, Shopee, Shein, etc.) para organizar os pallets"
      queryKey="admin-pallet-categories"
      orderBy="sort_order"
      searchKeys={["name", "description"]}
      nameKey="name"
      emptyState="Nenhuma categoria cadastrada. Clique em Novo para começar."
      initialValues={{ name: "", slug: "", description: "", sort_order: 0, is_active: true }}
      fields={[
        { key: "name", label: "Nome", required: true, placeholder: "Mercado Livre" },
        { key: "slug", label: "Slug (opcional)", placeholder: "mercado-livre" },
        { key: "description", label: "Descrição", type: "textarea", rows: 2, span: "full" },
        { key: "sort_order", label: "Ordem", type: "number" },
        { key: "is_active", label: "Status", type: "switch" },
      ]}
      columns={[
        { key: "name", label: "Categoria" },
        { key: "sort_order", label: "Ordem" },
        { key: "is_active", label: "Status", render: (r) => (r.is_active ? "Ativo" : "Inativo") },
      ]}
    />
  );
}

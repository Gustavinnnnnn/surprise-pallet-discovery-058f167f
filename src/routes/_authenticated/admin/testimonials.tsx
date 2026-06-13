import { createFileRoute } from "@tanstack/react-router";
import { AdminCrudPage } from "@/components/admin/AdminCrudPage";

export const Route = createFileRoute("/_authenticated/admin/testimonials")({
  component: TestimonialsAdmin,
});

function TestimonialsAdmin() {
  return (
    <AdminCrudPage
      table="testimonials"
      title="Depoimentos"
      description="Gerencie provas sociais exibidas no site"
      queryKey="admin-testimonials"
      orderBy="sort_order"
      searchKeys={["customer_name", "city", "content"]}
      nameKey="customer_name"
      emptyState="Nenhum depoimento cadastrado."
      initialValues={{ customer_name: "", city: "", content: "", rating: 5, avatar_url: "", sort_order: 0, is_active: true }}
      fields={[
        { key: "customer_name", label: "Nome", required: true },
        { key: "city", label: "Cidade" },
        { key: "content", label: "Depoimento", type: "textarea", required: true, rows: 4, span: "full" },
        { key: "rating", label: "Nota", type: "number" },
        { key: "sort_order", label: "Ordem", type: "number" },
        { key: "avatar_url", label: "Foto do cliente", type: "image", span: "full" },
        { key: "is_active", label: "Status", type: "switch" },
      ]}
      columns={[
        { key: "customer_name", label: "Cliente" },
        { key: "city", label: "Cidade" },
        { key: "rating", label: "Nota", render: (r) => `${r.rating ?? 5}★` },
        { key: "is_active", label: "Status", render: (r) => (r.is_active ? "Ativo" : "Inativo") },
      ]}
    />
  );
}
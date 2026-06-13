import { createFileRoute } from "@tanstack/react-router";
import { AdminCrudPage } from "@/components/admin/AdminCrudPage";

export const Route = createFileRoute("/_authenticated/admin/banners")({
  component: BannersAdmin,
});

function BannersAdmin() {
  return (
    <AdminCrudPage
      table="banners"
      title="Banners"
      description="Gerencie banners e chamadas promocionais"
      queryKey="admin-banners"
      orderBy="sort_order"
      searchKeys={["title", "subtitle"]}
      nameKey="title"
      emptyState="Nenhum banner cadastrado."
      initialValues={{ title: "", subtitle: "", image_url: "", cta_label: "", cta_url: "#pallets", placement: "hero", sort_order: 0, is_active: true }}
      fields={[
        { key: "title", label: "Título", required: true },
        { key: "placement", label: "Posição", type: "select", options: [{ label: "Hero", value: "hero" }, { label: "Topo", value: "top" }, { label: "Meio", value: "middle" }, { label: "Rodapé", value: "bottom" }] },
        { key: "subtitle", label: "Subtítulo", span: "full" },
        { key: "image_url", label: "URL da imagem", type: "url", span: "full" },
        { key: "cta_label", label: "Texto do botão" },
        { key: "cta_url", label: "Link do botão" },
        { key: "sort_order", label: "Ordem", type: "number" },
        { key: "is_active", label: "Status", type: "switch" },
      ]}
      columns={[
        { key: "title", label: "Banner" },
        { key: "placement", label: "Posição" },
        { key: "cta_label", label: "Botão" },
        { key: "is_active", label: "Status", render: (r) => (r.is_active ? "Ativo" : "Inativo") },
      ]}
    />
  );
}
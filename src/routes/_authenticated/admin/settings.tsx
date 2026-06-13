import { createFileRoute } from "@tanstack/react-router";
import { AdminCrudPage } from "@/components/admin/AdminCrudPage";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SettingsAdmin,
});

function SettingsAdmin() {
  return (
    <AdminCrudPage
      table="site_settings"
      title="Configurações"
      description="Configure textos, contato e links do site"
      queryKey="admin-settings"
      orderBy="created_at"
      searchKeys={["site_name", "whatsapp", "email"]}
      nameKey="site_name"
      emptyState="Nenhuma configuração cadastrada."
      initialValues={{ site_name: "Pallets Surpresa", whatsapp: "", email: "", instagram_url: "", checkout_url: "", announcement: "", hero_title: "", hero_subtitle: "" }}
      fields={[
        { key: "site_name", label: "Nome do site", required: true },
        { key: "whatsapp", label: "WhatsApp", type: "tel" },
        { key: "email", label: "E-mail", type: "email" },
        { key: "instagram_url", label: "Instagram", type: "url" },
        { key: "checkout_url", label: "Link de checkout", type: "url", span: "full" },
        { key: "announcement", label: "Aviso do topo", span: "full" },
        { key: "hero_title", label: "Título principal", type: "textarea", rows: 3, span: "full" },
        { key: "hero_subtitle", label: "Subtítulo principal", type: "textarea", rows: 3, span: "full" },
      ]}
      columns={[
        { key: "site_name", label: "Site" },
        { key: "whatsapp", label: "WhatsApp" },
        { key: "email", label: "E-mail" },
        { key: "checkout_url", label: "Checkout" },
      ]}
    />
  );
}
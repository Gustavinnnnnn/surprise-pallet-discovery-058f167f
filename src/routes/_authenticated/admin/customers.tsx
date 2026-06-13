import { createFileRoute } from "@tanstack/react-router";
import { AdminCrudPage } from "@/components/admin/AdminCrudPage";

export const Route = createFileRoute("/_authenticated/admin/customers")({
  component: CustomersAdmin,
});

function CustomersAdmin() {
  return (
    <AdminCrudPage
      table="customers"
      title="Clientes"
      description="Cadastre e acompanhe clientes"
      queryKey="admin-customers"
      orderBy="created_at"
      searchKeys={["full_name", "email", "phone", "city"]}
      nameKey="full_name"
      emptyState="Nenhum cliente cadastrado."
      initialValues={{ full_name: "", email: "", phone: "", document: "", city: "", state: "", notes: "" }}
      fields={[
        { key: "full_name", label: "Nome completo", required: true },
        { key: "phone", label: "WhatsApp", type: "tel" },
        { key: "email", label: "E-mail", type: "email" },
        { key: "document", label: "CPF/CNPJ" },
        { key: "city", label: "Cidade" },
        { key: "state", label: "Estado" },
        { key: "notes", label: "Observações", type: "textarea", rows: 4, span: "full" },
      ]}
      columns={[
        { key: "full_name", label: "Cliente" },
        { key: "phone", label: "WhatsApp" },
        { key: "email", label: "E-mail" },
        { key: "city", label: "Cidade" },
      ]}
    />
  );
}
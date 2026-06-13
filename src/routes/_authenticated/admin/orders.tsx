import { createFileRoute } from "@tanstack/react-router";
import { AdminCrudPage } from "@/components/admin/AdminCrudPage";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: OrdersAdmin,
});

const statusOptions = [
  { label: "Novo", value: "novo" },
  { label: "Aguardando pagamento", value: "aguardando_pagamento" },
  { label: "Pago", value: "pago" },
  { label: "Em separação", value: "em_separacao" },
  { label: "Enviado", value: "enviado" },
  { label: "Entregue", value: "entregue" },
  { label: "Cancelado", value: "cancelado" },
];

function OrdersAdmin() {
  return (
    <AdminCrudPage
      table="orders"
      title="Pedidos"
      description="Controle pedidos, pagamento e envio"
      queryKey="admin-orders"
      orderBy="created_at"
      searchKeys={["order_number", "customer_name", "customer_phone", "pallet_name", "status"]}
      nameKey="order_number"
      emptyState="Nenhum pedido cadastrado."
      initialValues={{ customer_name: "", customer_email: "", customer_phone: "", pallet_name: "", total_amount: 0, status: "novo", payment_method: "", tracking_code: "", notes: "" }}
      fields={[
        { key: "customer_name", label: "Cliente", required: true },
        { key: "customer_phone", label: "WhatsApp", type: "tel" },
        { key: "customer_email", label: "E-mail", type: "email" },
        { key: "pallet_name", label: "Pallet", required: true },
        { key: "total_amount", label: "Total (R$)", type: "number" },
        { key: "status", label: "Status", type: "select", options: statusOptions },
        { key: "payment_method", label: "Pagamento" },
        { key: "tracking_code", label: "Rastreio" },
        { key: "notes", label: "Observações", type: "textarea", rows: 4, span: "full" },
      ]}
      columns={[
        { key: "order_number", label: "Pedido" },
        { key: "customer_name", label: "Cliente" },
        { key: "total_amount", label: "Total", render: (r) => `R$ ${Number(r.total_amount ?? 0).toFixed(2)}` },
        { key: "status", label: "Status" },
      ]}
    />
  );
}
import { createFileRoute } from "@tanstack/react-router";
import { AdminCrudPage } from "@/components/admin/AdminCrudPage";

export const Route = createFileRoute("/_authenticated/admin/faq")({
  component: FaqAdmin,
});

function FaqAdmin() {
  return (
    <AdminCrudPage
      table="faq_items"
      title="FAQ"
      description="Gerencie perguntas e respostas do site"
      queryKey="admin-faq"
      orderBy="sort_order"
      searchKeys={["question", "answer"]}
      nameKey="question"
      emptyState="Nenhuma pergunta cadastrada."
      initialValues={{ question: "", answer: "", sort_order: 0, is_active: true }}
      fields={[
        { key: "question", label: "Pergunta", required: true, span: "full" },
        { key: "answer", label: "Resposta", type: "textarea", required: true, rows: 5, span: "full" },
        { key: "sort_order", label: "Ordem", type: "number" },
        { key: "is_active", label: "Status", type: "switch" },
      ]}
      columns={[
        { key: "question", label: "Pergunta" },
        { key: "answer", label: "Resposta" },
        { key: "sort_order", label: "Ordem" },
        { key: "is_active", label: "Status", render: (r) => (r.is_active ? "Ativo" : "Inativo") },
      ]}
    />
  );
}
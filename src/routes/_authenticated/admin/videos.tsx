import { createFileRoute } from "@tanstack/react-router";
import { AdminCrudPage } from "@/components/admin/AdminCrudPage";

export const Route = createFileRoute("/_authenticated/admin/videos")({
  component: VideosAdmin,
});

function VideosAdmin() {
  return (
    <AdminCrudPage
      table="site_videos"
      title="Vídeos"
      description="Gerencie os unboxings exibidos no site"
      queryKey="admin-videos"
      orderBy="sort_order"
      searchKeys={["title", "customer_handle"]}
      nameKey="title"
      emptyState="Nenhum vídeo cadastrado."
      initialValues={{ title: "", subtitle: "", customer_handle: "", views_label: "", video_url: "", thumbnail_url: "", sort_order: 0, is_active: true }}
      fields={[
        { key: "title", label: "Título", required: true },
        { key: "customer_handle", label: "Cliente / @", placeholder: "@cliente" },
        { key: "subtitle", label: "Legenda", span: "full" },
        { key: "video_url", label: "Arquivo do vídeo", type: "video", span: "full" },
        { key: "thumbnail_url", label: "Capa do vídeo", type: "image", span: "full" },
        { key: "views_label", label: "Visualizações", placeholder: "120k views" },
        { key: "sort_order", label: "Ordem", type: "number" },
        { key: "is_active", label: "Status", type: "switch" },
      ]}
      columns={[
        { key: "title", label: "Vídeo" },
        { key: "customer_handle", label: "Cliente" },
        { key: "views_label", label: "Views" },
        { key: "is_active", label: "Status", render: (r) => (r.is_active ? "Ativo" : "Inativo") },
      ]}
    />
  );
}
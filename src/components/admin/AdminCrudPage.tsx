import { useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

type FieldType = "text" | "email" | "tel" | "url" | "number" | "textarea" | "switch" | "select";

export type AdminField = {
  key: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
  rows?: number;
  span?: "full" | "half";
};

export type AdminColumn = {
  key: string;
  label: string;
  render?: (row: Record<string, unknown>) => ReactNode;
};

type AdminCrudPageProps = {
  table: string;
  title: string;
  description: string;
  queryKey: string;
  fields: AdminField[];
  columns: AdminColumn[];
  emptyState: string;
  initialValues: Record<string, unknown>;
  orderBy?: string;
  searchKeys?: string[];
  nameKey?: string;
  beforeSave?: (values: Record<string, unknown>) => Record<string, unknown>;
};

export function AdminCrudPage({
  table,
  title,
  description,
  queryKey,
  fields,
  columns,
  emptyState,
  initialValues,
  orderBy = "created_at",
  searchKeys = [],
  nameKey = "title",
  beforeSave,
}: AdminCrudPageProps) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<Record<string, unknown>>(initialValues);

  const { data = [], isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from(table)
        .select("*")
        .order(orderBy, { ascending: true });
      if (error) throw error;
      return (data ?? []) as Record<string, unknown>[];
    },
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return data;
    return data.filter((row) =>
      searchKeys.some((key) => String(row[key] ?? "").toLowerCase().includes(term)),
    );
  }, [data, search, searchKeys]);

  const saveMutation = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      const payload = normalizePayload(beforeSave ? beforeSave(values) : values);
      if (payload.id) {
        const { id, ...rest } = payload;
        const { error } = await (supabase as any).from(table).update(rest).eq("id", id as string);
        if (error) throw error;
      } else {
        const { id: _ignored, ...rest } = payload;
        const { error } = await (supabase as any).from(table).insert(rest);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Salvo com sucesso");
      qc.invalidateQueries({ queryKey: [queryKey] });
      setOpen(false);
      setForm(initialValues);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao salvar"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Excluído com sucesso");
      qc.invalidateQueries({ queryKey: [queryKey] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao excluir"),
  });

  function startNew() {
    setForm(initialValues);
    setOpen(true);
  }

  function startEdit(row: Record<string, unknown>) {
    setForm({ ...initialValues, ...row });
    setOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "Montserrat, sans-serif" }}>{title}</h1>
          <p className="text-zinc-400 text-sm mt-1">{description}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={startNew} className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
              <Plus size={16} /> Novo
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>{form.id ? `Editar ${title}` : `Novo ${title}`}</DialogTitle>
            </DialogHeader>
            <form
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                saveMutation.mutate(form);
              }}
            >
              {fields.map((field) => (
                <FieldControl
                  key={field.key}
                  field={field}
                  value={form[field.key]}
                  onChange={(value) => setForm((current) => ({ ...current, [field.key]: value }))}
                />
              ))}
              <Button type="submit" disabled={saveMutation.isPending} className="md:col-span-2 w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90">
                {saveMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {searchKeys.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." className="pl-9 bg-zinc-900 border-zinc-800 text-white" />
        </div>
      )}

      {isLoading ? (
        <p className="text-zinc-400">Carregando...</p>
      ) : filtered.length === 0 ? (
        <Card className="p-8 bg-zinc-900 border-zinc-800 text-center text-zinc-400">{emptyState}</Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((row) => (
            <Card key={String(row.id)} className="p-4 bg-zinc-900 border-zinc-800 text-white">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0 grid gap-2 md:grid-cols-4">
                  {columns.map((column) => (
                    <div key={column.key} className="min-w-0">
                      <p className="text-[11px] uppercase text-zinc-500 font-bold">{column.label}</p>
                      <div className="text-sm text-zinc-100 truncate">
                        {column.render ? column.render(row) : String(row[column.key] ?? "—")}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => startEdit(row)} className="text-zinc-300 hover:bg-zinc-800">
                    <Pencil size={16} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      if (confirm(`Excluir ${String(row[nameKey] ?? title)}?`)) deleteMutation.mutate(String(row.id));
                    }}
                    className="text-red-400 hover:bg-zinc-800"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function FieldControl({ field, value, onChange }: { field: AdminField; value: unknown; onChange: (value: unknown) => void }) {
  const wrapperClass = field.span === "full" || field.type === "textarea" || field.type === "switch" ? "md:col-span-2" : "";

  return (
    <div className={wrapperClass}>
      <Label className="text-zinc-300 text-xs mb-1 block">{field.label}</Label>
      {field.type === "textarea" ? (
        <Textarea value={String(value ?? "")} required={field.required} rows={field.rows ?? 3} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} className="bg-zinc-800 border-zinc-700" />
      ) : field.type === "switch" ? (
        <div className="h-10 flex items-center gap-3">
          <Switch checked={Boolean(value)} onCheckedChange={onChange} />
          <span className="text-sm text-zinc-400">{Boolean(value) ? "Ativo" : "Inativo"}</span>
        </div>
      ) : field.type === "select" ? (
        <select
          value={String(value ?? "")}
          required={field.required}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 text-sm text-white outline-none focus:ring-1 focus:ring-[#FF6B00]"
        >
          {(field.options ?? []).map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      ) : (
        <Input
          type={field.type ?? "text"}
          value={field.type === "number" ? Number(value ?? 0) : String(value ?? "")}
          required={field.required}
          step={field.type === "number" ? "0.01" : undefined}
          onChange={(e) => onChange(field.type === "number" ? Number(e.target.value) : e.target.value)}
          placeholder={field.placeholder}
          className="bg-zinc-800 border-zinc-700"
        />
      )}
    </div>
  );
}

function normalizePayload(values: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, value === "" ? null : value]),
  );
}
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/pallets")({
  component: PalletsAdmin,
});

type Pallet = {
  id: string;
  name: string;
  price: number;
  description: string | null;
  min_boxes: number;
  max_boxes: number;
  image_url: string | null;
  badge: string | null;
  promo_text: string | null;
  sort_order: number;
  is_active: boolean;
};

type FormState = Omit<Pallet, "id"> & { id?: string };

const empty: FormState = {
  name: "",
  price: 0,
  description: "",
  min_boxes: 1,
  max_boxes: 1,
  image_url: "",
  badge: "",
  promo_text: "",
  sort_order: 0,
  is_active: true,
};

function PalletsAdmin() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(empty);

  const { data: pallets = [], isLoading } = useQuery({
    queryKey: ["pallets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pallets")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as Pallet[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (p: FormState) => {
      const payload = { ...p, description: p.description || null, image_url: p.image_url || null, badge: p.badge || null, promo_text: p.promo_text || null };
      if (p.id) {
        const { id, ...rest } = payload;
        const { error } = await supabase.from("pallets").update(rest).eq("id", id as string);
        if (error) throw error;
      } else {
        const { id: _ignored, ...rest } = payload;
        const { error } = await supabase.from("pallets").insert(rest);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Pallet salvo");
      qc.invalidateQueries({ queryKey: ["pallets"] });
      setOpen(false);
      setForm(empty);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao salvar"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pallets").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Pallet excluído");
      qc.invalidateQueries({ queryKey: ["pallets"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  function startNew() {
    setForm(empty);
    setOpen(true);
  }
  function startEdit(p: Pallet) {
    setForm(p);
    setOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "Montserrat, sans-serif" }}>Pallets</h1>
          <p className="text-zinc-400 text-sm mt-1">Gerencie os produtos do site</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={startNew} className="bg-[#FF6B00] hover:bg-[#FF6B00]/90">
              <Plus size={16} /> Novo
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-lg max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>{form.id ? "Editar pallet" : "Novo pallet"}</DialogTitle>
            </DialogHeader>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                saveMutation.mutate(form);
              }}
            >
              <Field label="Nome">
                <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Preço (R$)">
                  <Input type="number" step="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} className="bg-zinc-800 border-zinc-700" />
                </Field>
                <Field label="Ordem">
                  <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} className="bg-zinc-800 border-zinc-700" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Mín. caixas">
                  <Input type="number" value={form.min_boxes} onChange={(e) => setForm({ ...form, min_boxes: parseInt(e.target.value) || 1 })} className="bg-zinc-800 border-zinc-700" />
                </Field>
                <Field label="Máx. caixas">
                  <Input type="number" value={form.max_boxes} onChange={(e) => setForm({ ...form, max_boxes: parseInt(e.target.value) || 1 })} className="bg-zinc-800 border-zinc-700" />
                </Field>
              </div>
              <Field label="Descrição">
                <Textarea value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-zinc-800 border-zinc-700" rows={3} />
              </Field>
              <Field label="URL da imagem">
                <Input value={form.image_url ?? ""} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." className="bg-zinc-800 border-zinc-700" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Selo">
                  <Input value={form.badge ?? ""} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="MAIS VENDIDO" className="bg-zinc-800 border-zinc-700" />
                </Field>
                <Field label="Texto promo">
                  <Input value={form.promo_text ?? ""} onChange={(e) => setForm({ ...form, promo_text: e.target.value })} className="bg-zinc-800 border-zinc-700" />
                </Field>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                <Label className="text-zinc-300">Ativo</Label>
              </div>
              <Button type="submit" disabled={saveMutation.isPending} className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90">
                {saveMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-zinc-400">Carregando...</p>
      ) : pallets.length === 0 ? (
        <Card className="p-8 bg-zinc-900 border-zinc-800 text-center text-zinc-400">
          Nenhum pallet cadastrado. Clique em <b className="text-white">Novo</b> para começar.
        </Card>
      ) : (
        <div className="grid gap-3">
          {pallets.map((p) => (
            <Card key={p.id} className="p-4 bg-zinc-900 border-zinc-800 text-white flex items-center gap-4">
              <div className="w-16 h-16 rounded bg-zinc-800 overflow-hidden flex-shrink-0">
                {p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate">{p.name}</h3>
                  {!p.is_active && <span className="text-[10px] bg-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded">INATIVO</span>}
                </div>
                <p className="text-sm text-[#FF6B00] font-bold">R$ {p.price.toFixed(2)}</p>
                <p className="text-xs text-zinc-500">{p.min_boxes}–{p.max_boxes} caixas</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button size="icon" variant="ghost" onClick={() => startEdit(p)} className="text-zinc-300 hover:bg-zinc-800">
                  <Pencil size={16} />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => { if (confirm(`Excluir ${p.name}?`)) deleteMutation.mutate(p.id); }} className="text-red-400 hover:bg-zinc-800">
                  <Trash2 size={16} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-zinc-300 text-xs mb-1 block">{label}</Label>
      {children}
    </div>
  );
}

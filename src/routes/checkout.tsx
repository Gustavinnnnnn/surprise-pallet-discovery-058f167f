import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { z } from "zod";
import { createParadisePixTransaction } from "@/lib/paradise.functions";
import { ensurePixQrImage, extractPixPaymentData } from "@/lib/pix-response";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Copy, Check, ArrowLeft, ShieldCheck } from "lucide-react";

const searchSchema = z.object({
  id: z.string().optional(),
  name: z.string().default("Pallet"),
  price: z.coerce.number().default(0),
  image: z.string().optional(),
});

export const Route = createFileRoute("/checkout")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Checkout — Pallets Surpresa" }] }),
  component: CheckoutPage,
});

const onlyDigits = (s: string) => s.replace(/\D/g, "");
type Step = "dados" | "endereco" | "pagamento";

function CheckoutPage() {
  const { id, name, price, image } = Route.useSearch();
  const navigate = useNavigate();
  const createTx = useServerFn(createParadisePixTransaction);

  const [step, setStep] = useState<Step>("dados");
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [pixData, setPixData] = useState<{ qr_code?: string; qr_code_image?: string; copy_paste?: string } | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", phone: "", document: "",
    zip_code: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "",
  });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const lookupCep = async (raw: string) => {
    const cep = onlyDigits(raw);
    if (cep.length !== 8) return;
    setCepLoading(true);
    try {
      const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const d = await r.json();
      if (d?.erro) { toast.error("CEP não encontrado"); return; }
      setForm((f) => ({
        ...f,
        street: d.logradouro || f.street,
        neighborhood: d.bairro || f.neighborhood,
        city: d.localidade || f.city,
        state: d.uf || f.state,
      }));
    } catch {
      toast.error("Falha ao consultar CEP");
    } finally {
      setCepLoading(false);
    }
  };

  const validateDados = () => {
    if (form.name.trim().length < 3) return "Informe seu nome completo";
    if (!/.+@.+\..+/.test(form.email)) return "E-mail inválido";
    if (onlyDigits(form.phone).length < 10) return "Telefone inválido (com DDD)";
    if (onlyDigits(form.document).length !== 11) return "CPF deve ter 11 dígitos";
    return null;
  };
  const validateEndereco = () => {
    if (onlyDigits(form.zip_code).length !== 8) return "CEP deve ter 8 dígitos";
    if (!form.street.trim()) return "Informe a rua";
    if (!form.number.trim()) return "Informe o número";
    if (!form.city.trim()) return "Informe a cidade";
    if (form.state.trim().length !== 2) return "UF com 2 letras";
    return null;
  };

  const handleNext = () => {
    if (step === "dados") {
      const err = validateDados();
      if (err) return toast.error(err);
      setStep("endereco");
    } else if (step === "endereco") {
      const err = validateEndereco();
      if (err) return toast.error(err);
      void handlePay();
    }
  };

  const handlePay = async () => {
    setPixData(null); setPaymentError(null); setLoading(true); setStep("pagamento");
    try {
      const res: any = await createTx({
        data: {
          amount: Number(price),
          description: String(name || "Pallet"),
          reference: `PALLET-${id ?? "x"}-${Date.now()}`,
          customer: {
            name: form.name.trim(),
            email: form.email.trim(),
            document: onlyDigits(form.document),
            phone: onlyDigits(form.phone),
          },
        },
      });
      const paymentData = await ensurePixQrImage(extractPixPaymentData(res));
      if (!paymentData.copy_paste && !paymentData.qr_code_image) {
        throw new Error("PIX gerado, mas a Paradise não retornou QR Code nem chave copia e cola.");
      }
      setPixData(paymentData);
      toast.success("PIX gerado! Pague para confirmar.");
    } catch (e: any) {
      const message = e?.message || "Erro ao gerar pagamento";
      setPaymentError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!pixData?.copy_paste) return;
    await navigator.clipboard.writeText(pixData.copy_paste);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const steps: Step[] = ["dados", "endereco", "pagamento"];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Voltar
          </Link>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-4" /> Pagamento seguro
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 md:py-10 grid md:grid-cols-[1fr_360px] gap-6">
        <section>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold">Finalizar compra</h1>
          <div className="flex gap-1 mt-4 mb-6">
            {steps.map((s, i) => (
              <div key={s} className={`h-1.5 flex-1 rounded ${steps.indexOf(step) >= i ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>

          {step === "dados" && (
            <div className="space-y-4 max-w-xl">
              <h2 className="font-semibold text-lg">Seus dados</h2>
              <div><Label>Nome completo</Label><Input value={form.name} onChange={set("name")} placeholder="João Silva" /></div>
              <div><Label>E-mail</Label><Input type="email" value={form.email} onChange={set("email")} placeholder="voce@email.com" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>WhatsApp</Label><Input value={form.phone} onChange={set("phone")} placeholder="11999999999" /></div>
                <div><Label>CPF</Label><Input value={form.document} onChange={set("document")} placeholder="000.000.000-00" /></div>
              </div>
              <Button size="lg" className="w-full" onClick={handleNext}>Continuar</Button>
            </div>
          )}

          {step === "endereco" && (
            <div className="space-y-4 max-w-xl">
              <h2 className="font-semibold text-lg">Endereço de entrega</h2>
              <div>
                <Label>CEP</Label>
                <div className="relative">
                  <Input
                    value={form.zip_code}
                    onChange={(e) => { set("zip_code")(e); if (onlyDigits(e.target.value).length === 8) void lookupCep(e.target.value); }}
                    onBlur={(e) => void lookupCep(e.target.value)}
                    placeholder="00000-000"
                    maxLength={9}
                  />
                  {cepLoading && <Loader2 className="absolute right-3 top-2.5 size-4 animate-spin text-muted-foreground" />}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Preenchemos o endereço automaticamente.</p>
              </div>
              <div><Label>Rua</Label><Input value={form.street} onChange={set("street")} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Número</Label><Input value={form.number} onChange={set("number")} /></div>
                <div><Label>Complemento</Label><Input value={form.complement} onChange={set("complement")} /></div>
              </div>
              <div><Label>Bairro</Label><Input value={form.neighborhood} onChange={set("neighborhood")} /></div>
              <div className="grid grid-cols-[1fr_100px] gap-3">
                <div><Label>Cidade</Label><Input value={form.city} onChange={set("city")} /></div>
                <div><Label>UF</Label><Input value={form.state} onChange={set("state")} maxLength={2} /></div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setStep("dados")}><ArrowLeft className="size-4" />Voltar</Button>
                <Button className="flex-1" size="lg" onClick={handleNext} disabled={loading}>
                  {loading && <Loader2 className="animate-spin size-4" />} Gerar PIX
                </Button>
              </div>
            </div>
          )}

          {step === "pagamento" && (
            <div className="space-y-4 max-w-xl">
              <h2 className="font-semibold text-lg">Pagamento via PIX</h2>
              {loading && (
                <div className="py-12 flex flex-col items-center gap-3">
                  <Loader2 className="animate-spin size-10" />
                  <p className="text-sm text-muted-foreground">Gerando PIX...</p>
                </div>
              )}
              {!loading && pixData && (
                <div className="rounded-lg border border-border p-6 text-center space-y-4">
                  {pixData.qr_code_image && (
                    <img
                      src={pixData.qr_code_image.startsWith("data:") ? pixData.qr_code_image : `data:image/png;base64,${pixData.qr_code_image}`}
                      alt="QR Code PIX" className="mx-auto w-64 h-64 bg-white p-2 rounded"
                    />
                  )}
                  {pixData.copy_paste && (
                    <>
                      <p className="text-xs text-muted-foreground">PIX Copia e Cola:</p>
                      <div className="text-xs bg-muted p-3 rounded break-all max-h-28 overflow-y-auto text-left">
                        {pixData.copy_paste}
                      </div>
                      <Button onClick={copy} className="w-full" variant="outline">
                        {copied ? <><Check className="size-4" />Copiado!</> : <><Copy className="size-4" />Copiar código PIX</>}
                      </Button>
                    </>
                  )}
                  <p className="text-xs text-muted-foreground">Após pagar, seu pedido será confirmado automaticamente.</p>
                </div>
              )}
              {!loading && !pixData && (
                <div className="space-y-3">
                  {paymentError && (
                    <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">{paymentError}</div>
                  )}
                  <Button variant="outline" onClick={() => setStep("endereco")}><ArrowLeft className="size-4" />Voltar</Button>
                </div>
              )}
            </div>
          )}
        </section>

        <aside className="md:sticky md:top-6 h-fit">
          <div className="rounded-lg border border-border p-4 space-y-3">
            <h3 className="font-semibold">Resumo do pedido</h3>
            <div className="flex gap-3">
              {image && <img src={image} alt={name} className="w-16 h-16 rounded object-cover" />}
              <div className="flex-1">
                <p className="text-sm font-medium">{name}</p>
                <p className="text-xs text-muted-foreground">Pallet surpresa</p>
              </div>
            </div>
            <div className="border-t border-border pt-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="font-display font-black text-xl text-primary">
                R$ {Number(price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { createTribopayTransaction } from "@/lib/tribopay.functions";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Copy, Check, ArrowLeft } from "lucide-react";

export type CheckoutPallet = {
  id?: string;
  name: string;
  price: number; // BRL units (reais)
  offer_hash?: string | null;
  product_hash?: string | null;
  image?: string | null;
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  pallet: CheckoutPallet | null;
  defaultOfferHash?: string | null;
  defaultProductHash?: string | null;
};

type Step = "dados" | "endereco" | "pagamento";

const onlyDigits = (s: string) => s.replace(/\D/g, "");

export function CheckoutDialog({ open, onOpenChange, pallet, defaultOfferHash, defaultProductHash }: Props) {
  const createTx = useServerFn(createTribopayTransaction);
  const [step, setStep] = useState<Step>("dados");
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState<{ qr_code?: string; qr_code_image?: string; copy_paste?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", phone: "", document: "",
    zip_code: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const reset = () => {
    setStep("dados"); setPixData(null); setLoading(false); setCopied(false);
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
    if (!pallet) return;
    const offer_hash = pallet.offer_hash || defaultOfferHash;
    const product_hash = pallet.product_hash || defaultProductHash;
    if (!offer_hash || !product_hash) {
      toast.error("Configuração TriboPay pendente. Avise o admin.");
      return;
    }
    setLoading(true);
    setStep("pagamento");
    try {
      const amount = Math.round(Number(pallet.price) * 100);
      const res: any = await createTx({
        data: {
          amount,
          offer_hash,
          payment_method: "pix",
          customer: {
            name: form.name.trim(),
            email: form.email.trim(),
            phone_number: onlyDigits(form.phone),
            document: onlyDigits(form.document),
            zip_code: onlyDigits(form.zip_code),
            street_name: form.street.trim(),
            number: form.number.trim(),
            complement: form.complement.trim() || undefined,
            neighborhood: form.neighborhood.trim() || undefined,
            city: form.city.trim(),
            state: form.state.trim().toUpperCase(),
          },
          cart: [{
            product_hash,
            title: pallet.name,
            price: amount,
            quantity: 1,
            operation_type: 1,
            tangible: true,
            cover: pallet.image || undefined,
          }],
          expire_in_days: 1,
        },
      });
      const pix = res?.pix ?? res?.transaction?.pix ?? res;
      setPixData({
        qr_code: pix?.qr_code || pix?.pix_qr_code,
        qr_code_image: pix?.qr_code_image || pix?.pix_qr_code_image,
        copy_paste: pix?.pix_copy_paste || pix?.qr_code || pix?.copy_paste,
      });
      toast.success("PIX gerado! Pague para confirmar.");
    } catch (e: any) {
      toast.error(e?.message || "Erro ao gerar pagamento");
      setStep("endereco");
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

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}
    >
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === "dados" && "Seus dados"}
            {step === "endereco" && "Endereço de entrega"}
            {step === "pagamento" && "Pagamento PIX"}
          </DialogTitle>
          <DialogDescription>
            {pallet?.name} — R$ {Number(pallet?.price || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-1 mb-2">
          {(["dados","endereco","pagamento"] as Step[]).map((s, i) => (
            <div key={s} className={`h-1.5 flex-1 rounded ${
              (["dados","endereco","pagamento"].indexOf(step) >= i) ? "bg-primary" : "bg-muted"
            }`} />
          ))}
        </div>

        {step === "dados" && (
          <div className="space-y-3">
            <div><Label>Nome completo</Label><Input value={form.name} onChange={set("name")} placeholder="João Silva" /></div>
            <div><Label>E-mail</Label><Input type="email" value={form.email} onChange={set("email")} placeholder="voce@email.com" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>WhatsApp</Label><Input value={form.phone} onChange={set("phone")} placeholder="11999999999" /></div>
              <div><Label>CPF</Label><Input value={form.document} onChange={set("document")} placeholder="000.000.000-00" /></div>
            </div>
            <Button className="w-full" onClick={handleNext}>Continuar</Button>
          </div>
        )}

        {step === "endereco" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>CEP</Label><Input value={form.zip_code} onChange={set("zip_code")} placeholder="00000-000" /></div>
              <div><Label>UF</Label><Input value={form.state} onChange={set("state")} maxLength={2} placeholder="SP" /></div>
            </div>
            <div><Label>Rua</Label><Input value={form.street} onChange={set("street")} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Número</Label><Input value={form.number} onChange={set("number")} /></div>
              <div><Label>Complemento</Label><Input value={form.complement} onChange={set("complement")} /></div>
            </div>
            <div><Label>Bairro</Label><Input value={form.neighborhood} onChange={set("neighborhood")} /></div>
            <div><Label>Cidade</Label><Input value={form.city} onChange={set("city")} /></div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("dados")}><ArrowLeft className="size-4" />Voltar</Button>
              <Button className="flex-1" onClick={handleNext} disabled={loading}>
                {loading && <Loader2 className="animate-spin size-4" />} Gerar PIX
              </Button>
            </div>
          </div>
        )}

        {step === "pagamento" && (
          <div className="space-y-3 text-center">
            {loading && (
              <div className="py-8 flex flex-col items-center gap-2">
                <Loader2 className="animate-spin size-8" />
                <p className="text-sm text-muted-foreground">Gerando PIX...</p>
              </div>
            )}
            {!loading && pixData && (
              <>
                {pixData.qr_code_image && (
                  <img src={pixData.qr_code_image.startsWith("data:") ? pixData.qr_code_image : `data:image/png;base64,${pixData.qr_code_image}`}
                       alt="QR Code PIX" className="mx-auto w-56 h-56 bg-white p-2 rounded" />
                )}
                {pixData.copy_paste && (
                  <>
                    <p className="text-xs text-muted-foreground">PIX Copia e Cola:</p>
                    <div className="text-xs bg-muted p-2 rounded break-all max-h-24 overflow-y-auto">
                      {pixData.copy_paste}
                    </div>
                    <Button onClick={copy} className="w-full" variant="outline">
                      {copied ? <><Check className="size-4" />Copiado!</> : <><Copy className="size-4" />Copiar código PIX</>}
                    </Button>
                  </>
                )}
                <p className="text-xs text-muted-foreground">Após pagar, seu pedido será confirmado automaticamente.</p>
              </>
            )}
            {!loading && !pixData && (
              <Button variant="outline" onClick={() => setStep("endereco")}><ArrowLeft className="size-4" />Voltar</Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Menu, X, Package, Truck, Gift, ShieldCheck, ChevronRight, Play,
  Home, Boxes, Film, HelpCircle, ShoppingCart, Star, Flame,
} from "lucide-react";
import heroImg from "@/assets/hero-pallets.jpg";
import palletImg from "@/assets/pallet-card.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pallets Surpresa — Descubra o que está escondido" },
      { name: "description", content: "Compre pallets surpresa de logística reversa. Produtos variados, envio para todo o Brasil, compra 100% segura." },
      { property: "og:title", content: "Pallets Surpresa — Descubra o que está escondido" },
      { property: "og:description", content: "Compre pallets surpresa de logística reversa. Produtos variados, envio para todo o Brasil." },
    ],
  }),
  component: Index,
});

const pallets = [
  { name: "Pallet Starter", price: "R$ 1.499", boxes: "~15 caixas", tag: "Iniciante" },
  { name: "Pallet Trader", price: "R$ 2.899", boxes: "~30 caixas", tag: "Mais vendido" },
  { name: "Pallet Reseller", price: "R$ 4.799", boxes: "~55 caixas", tag: "Revenda" },
  { name: "Pallet Titan",   price: "R$ 8.499", boxes: "~100 caixas", tag: "Top tier" },
];

const products = [
  { emoji: "📱", name: "Smartphones" },
  { emoji: "🎧", name: "Fones Bluetooth" },
  { emoji: "⌚", name: "Smartwatches" },
  { emoji: "🎮", name: "Acessórios Gamer" },
  { emoji: "🔌", name: "Carregadores" },
  { emoji: "🖥️", name: "Monitores" },
  { emoji: "🔨", name: "Ferramentas" },
  { emoji: "🏠", name: "Utilidades" },
  { emoji: "📦", name: "Organizadores" },
  { emoji: "💡", name: "Eletrônicos" },
];

const benefits = [
  { icon: Package, title: "Pallets Lacrados", desc: "Embalagem original, sem violação." },
  { icon: Truck, title: "Envio Brasil", desc: "Entregamos em todo o território." },
  { icon: Gift, title: "Produtos Variados", desc: "Mistério em cada caixa." },
  { icon: ShieldCheck, title: "Compra Segura", desc: "Pagamento criptografado." },
];

const steps = [
  "Escolha seu pallet.",
  "Finalize sua compra com segurança.",
  "Selecionamos um pallet aleatório para você.",
  "Realizamos o envio com rastreio.",
  "Receba e faça seu unboxing.",
];

const impactPhrases = [
  "Cada pallet é único",
  "Você nunca sabe o que vai receber",
  "Milhares de produtos diferentes",
  "Estoque limitado",
  "Logística reversa de verdade",
  "Novas oportunidades todo dia",
];

const testimonials = [
  { name: "Lucas M.", city: "São Paulo, SP", text: "Recebi um Pallet Trader e veio cheio de eletrônicos. Lucrei na revenda!", rating: 5 },
  { name: "Aline R.", city: "Belo Horizonte, MG", text: "Embalagem lacrada, entrega rápida. Experiência incrível.", rating: 5 },
  { name: "Diego S.", city: "Curitiba, PR", text: "Comprei o Reseller, virei revendedor em 2 semanas.", rating: 5 },
];

const faqs = [
  { q: "Como funciona a compra do pallet surpresa?", a: "Você escolhe o tamanho do pallet, finaliza o pagamento e nós separamos um pallet aleatório de logística reversa para envio." },
  { q: "Posso escolher os produtos que virão?", a: "Não. A surpresa faz parte da experiência. Trabalhamos com lotes mistos de devoluções e excesso de estoque." },
  { q: "Os produtos vêm novos?", a: "A maioria sim. Podem incluir itens novos, abertos, devoluções e itens de mostruário." },
  { q: "Vocês entregam em todo o Brasil?", a: "Sim, enviamos para todas as regiões via transportadoras parceiras com rastreio." },
  { q: "Existe garantia?", a: "Garantimos lacre, peso e quantidade declarada. Itens individuais seguem política do fabricante." },
];

function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: siteData } = useQuery({
    queryKey: ["public-site-content"],
    queryFn: async () => {
      const [settings, dbPallets, videos, dbTestimonials, dbFaqs, banners] = await Promise.all([
        supabase.from("site_settings").select("*").limit(1).maybeSingle(),
        supabase.from("pallets").select("*").eq("is_active", true).order("sort_order", { ascending: true }),
        supabase.from("site_videos").select("*").eq("is_active", true).order("sort_order", { ascending: true }),
        supabase.from("testimonials").select("*").eq("is_active", true).order("sort_order", { ascending: true }),
        supabase.from("faq_items").select("*").eq("is_active", true).order("sort_order", { ascending: true }),
        supabase.from("banners").select("*").eq("is_active", true).order("sort_order", { ascending: true }),
      ]);
      if (settings.error) throw settings.error;
      if (dbPallets.error) throw dbPallets.error;
      if (videos.error) throw videos.error;
      if (dbTestimonials.error) throw dbTestimonials.error;
      if (dbFaqs.error) throw dbFaqs.error;
      if (banners.error) throw banners.error;
      return {
        settings: settings.data,
        pallets: dbPallets.data ?? [],
        videos: videos.data ?? [],
        testimonials: dbTestimonials.data ?? [],
        faqs: dbFaqs.data ?? [],
        banners: banners.data ?? [],
      };
    },
  });

  const settings = siteData?.settings;
  const activePallets = siteData?.pallets?.length ? siteData.pallets : pallets;
  const activeVideos = siteData?.videos ?? [];
  const activeTestimonials = siteData?.testimonials?.length ? siteData.testimonials : testimonials;
  const activeFaqs = siteData?.faqs?.length ? siteData.faqs : faqs;
  const heroBanner = siteData?.banners?.find((b) => b.placement === "hero");
  const checkoutLink = settings?.checkout_url || "#pallets";
  const heroTitle = heroBanner?.title || settings?.hero_title || "COMPRE PALLETS SURPRESA E DESCUBRA O QUE ESTÁ ESCONDIDO";
  const heroSubtitle = heroBanner?.subtitle || settings?.hero_subtitle || "Produtos de logística reversa, devoluções e excesso de estoque. Cada pallet é uma nova oportunidade.";
  const announcement = settings?.announcement || "ESTOQUE LIMITADO HOJE";

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 md:pb-0">
      {/* HEADER */}
      <header className="fixed top-0 inset-x-0 z-50 bg-ink/90 backdrop-blur border-b border-white/5">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-4 h-14">
          <a href="#top" className="flex items-center gap-2 font-display font-extrabold text-lg">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded bg-brand text-brand-foreground">P</span>
            <span>{settings?.site_name || "PALLETS"}<span className="text-brand">SURPRESA</span></span>
          </a>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="#pallets" className="hover:text-brand">Pallets</a>
            <a href="#como" className="hover:text-brand">Como funciona</a>
            <a href="#unboxings" className="hover:text-brand">Unboxings</a>
            <a href="#faq" className="hover:text-brand">FAQ</a>
          </div>
          <div className="flex items-center gap-2">
            <a href="#pallets" className="hidden sm:inline-flex h-10 items-center rounded-md bg-brand px-4 font-display font-bold text-sm text-brand-foreground hover:brightness-110 transition">
              COMPRAR AGORA
            </a>
            <button aria-label="Menu" onClick={() => setMenuOpen(v => !v)} className="md:hidden h-10 w-10 grid place-items-center rounded-md bg-white/5">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="md:hidden border-t border-white/5 bg-ink">
            {["pallets","como","unboxings","faq"].map(id => (
              <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 border-b border-white/5 font-display font-semibold capitalize">
                {id === "como" ? "Como funciona" : id}
              </a>
            ))}
            <a href="#pallets" onClick={() => setMenuOpen(false)} className="block px-4 py-3 bg-brand text-brand-foreground text-center font-display font-bold">
              COMPRAR AGORA
            </a>
          </nav>
        )}
      </header>

      {/* HERO */}
      <section id="top" className="relative min-h-[100svh] flex items-center pt-14">
        <img src={heroBanner?.image_url || heroImg} alt="Pallets lacrados em armazém" className="absolute inset-0 w-full h-full object-cover" width={1280} height={1600} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black" />
        <div className="relative mx-auto max-w-6xl w-full px-4 py-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand/15 border border-brand/40 px-3 py-1 text-xs font-bold tracking-wide text-brand">
            <Flame size={14} /> {announcement}
          </span>
          <h1 className="mt-4 font-display font-black text-4xl sm:text-5xl md:text-7xl leading-[1.05] max-w-3xl">
            {highlightDiscover(heroTitle)}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-white/80 max-w-xl">
            {heroSubtitle}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md">
            <a href={checkoutLink === "#pallets" ? "#pallets" : checkoutLink} className="h-14 inline-flex items-center justify-center rounded-lg bg-brand text-brand-foreground font-display font-bold text-base px-6 hover:brightness-110 transition shadow-[0_10px_30px_-10px_#FF6B00]">
              VER PALLETS DISPONÍVEIS <ChevronRight size={18} className="ml-1" />
            </a>
            <a href="#como" className="h-14 inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/5 font-display font-bold text-base px-6 hover:bg-white/10 transition">
              COMO FUNCIONA
            </a>
          </div>
          <div className="mt-6 flex items-center gap-4 text-xs text-white/60">
            <div className="flex -space-x-2">
              {[0,1,2,3].map(i => <div key={i} className="h-7 w-7 rounded-full border-2 border-black bg-gradient-to-br from-brand to-orange-700" />)}
            </div>
            <span>+12.000 pallets enviados • Avaliação 4.9★</span>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="py-12 md:py-16 bg-ink">
        <div className="mx-auto max-w-6xl px-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {benefits.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl bg-white/[0.03] border border-white/5 p-4 md:p-6">
              <div className="h-10 w-10 rounded-lg bg-brand/15 text-brand grid place-items-center mb-3">
                <Icon size={20} />
              </div>
              <h3 className="font-display font-bold text-sm md:text-base">{title}</h3>
              <p className="mt-1 text-xs md:text-sm text-white/60">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PALLETS */}
      <section id="pallets" className="py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="font-display font-black text-3xl md:text-5xl">ESCOLHA SEU <span className="text-brand">PALLET</span></h2>
              <p className="mt-2 text-white/70">Escolha o tamanho ideal para sua experiência.</p>
            </div>
          </div>
          <div className="-mx-4 px-4 flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2">
            {activePallets.map((p) => {
              const imageUrl = "image_url" in p ? p.image_url : null;
              const tag = "badge" in p ? p.badge : p.tag;
              const boxes = "min_boxes" in p ? `${p.min_boxes}–${p.max_boxes} caixas` : p.boxes;
              const price = "price" in p && typeof p.price === "number" ? money(p.price) : p.price;
              return (
              <article key={p.name} className="snap-center shrink-0 w-[85%] sm:w-[55%] md:w-[28%] rounded-2xl overflow-hidden bg-ink border border-white/5 md:hover:border-brand/60 md:hover:-translate-y-1 transition">
                <div className="relative aspect-square">
                  <img src={imageUrl || palletImg} alt={p.name} loading="lazy" width={800} height={800} className="absolute inset-0 w-full h-full object-cover" />
                  {tag && <span className="absolute top-3 left-3 rounded-full bg-brand text-brand-foreground text-[10px] font-bold tracking-wide px-2 py-1">
                    {String(tag).toUpperCase()}
                  </span>}
                </div>
                <div className="p-4">
                  <h3 className="font-display font-extrabold text-lg">{p.name}</h3>
                  <p className="text-xs text-white/60 mt-0.5">{boxes}</p>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="font-display font-black text-2xl text-brand">{price}</span>
                    <span className="text-xs text-white/50">à vista</span>
                  </div>
                  <a href={checkoutLink} className="mt-4 w-full h-11 rounded-lg bg-brand text-brand-foreground font-display font-bold text-sm hover:brightness-110 transition inline-flex items-center justify-center">
                    COMPRAR AGORA
                  </a>
                </div>
              </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como" className="py-14 md:py-20 bg-ink">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-display font-black text-3xl md:text-5xl text-center">COMO <span className="text-brand">FUNCIONA</span></h2>
          <p className="text-center text-white/70 mt-2">Simples, rápido e cheio de surpresa.</p>
          <ol className="mt-8 grid gap-3 md:grid-cols-5">
            {steps.map((s, i) => (
              <li key={i} className="rounded-xl bg-white/[0.03] border border-white/5 p-4 flex md:flex-col gap-3 items-start">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-brand text-brand-foreground font-display font-black grid place-items-center">{i+1}</div>
                <p className="text-sm">{s}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* O QUE PODE VIR */}
      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-display font-black text-3xl md:text-5xl">O QUE <span className="text-brand">PODE VIR</span></h2>
          <p className="mt-2 text-white/70">Categorias frequentes em nossos pallets.</p>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {products.map(p => (
              <div key={p.name} className="rounded-xl bg-white/[0.03] border border-white/5 p-4 text-center hover:border-brand/40 transition">
                <div className="text-3xl">{p.emoji}</div>
                <div className="mt-2 font-display font-semibold text-sm">{p.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* UNBOXINGS */}
      <section id="unboxings" className="py-14 md:py-20 bg-ink">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-display font-black text-3xl md:text-5xl">UNBOXINGS <span className="text-brand">REAIS</span></h2>
          <p className="mt-2 text-white/70">Veja clientes abrindo seus pallets.</p>
        </div>
        <div className="mt-6 px-4 flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar">
          {(activeVideos.length ? activeVideos : Array.from({ length: 6 }).map((_, i) => ({ id: String(i), title: "Unboxing", customer_handle: `@cliente${i + 1}`, views_label: `${120 + i * 23}k views`, thumbnail_url: null, subtitle: "Pallet Trader" }))).map((video) => (
            <div key={video.id} className="snap-start shrink-0 w-[60%] sm:w-[35%] md:w-[22%] aspect-[9/16] rounded-2xl bg-gradient-to-br from-ink-3 to-black border border-white/10 relative overflow-hidden group">
              <img src={video.thumbnail_url || palletImg} alt={video.title} loading="lazy" width={800} height={800} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <a href={"video_url" in video && video.video_url ? video.video_url : "#unboxings"} className="absolute inset-0 grid place-items-center" aria-label={video.title}>
                <span className="h-14 w-14 rounded-full bg-brand text-brand-foreground grid place-items-center shadow-xl">
                  <Play size={22} fill="currentColor" />
                </span>
              </a>
              <div className="absolute bottom-3 left-3 right-3 text-xs">
                <div className="font-display font-bold">{video.customer_handle || video.title}</div>
                <div className="text-white/70">{video.subtitle || "Pallet Surpresa"} • {video.views_label || "novo"}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-display font-black text-3xl md:text-5xl">QUEM JÁ <span className="text-brand">RECEBEU</span></h2>
          <div className="mt-6 -mx-4 px-4 flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2">
            {activeTestimonials.map(t => (
              <figure key={"id" in t ? t.id : t.name} className="snap-center shrink-0 w-[85%] md:w-[32%] rounded-2xl bg-ink border border-white/5 p-5">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-brand to-orange-700 overflow-hidden">
                    {"avatar_url" in t && t.avatar_url && <img src={t.avatar_url} alt={t.customer_name} className="h-full w-full object-cover" />}
                  </div>
                  <div>
                    <div className="font-display font-bold">{"customer_name" in t ? t.customer_name : t.name}</div>
                    <div className="text-xs text-white/60">{t.city}</div>
                  </div>
                </div>
                <div className="mt-3 flex gap-0.5 text-brand">
                  {Array.from({length:t.rating}).map((_,i)=><Star key={i} size={14} fill="currentColor" />)}
                </div>
                <blockquote className="mt-3 text-sm text-white/80">"{"content" in t ? t.content : t.text}"</blockquote>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* IMPACT */}
      <section className="py-10 bg-brand text-brand-foreground overflow-hidden">
        <div className="flex gap-8 whitespace-nowrap animate-[scroll_40s_linear_infinite]">
          {[...impactPhrases, ...impactPhrases].map((p, i) => (
            <span key={i} className="font-display font-black text-2xl md:text-4xl uppercase flex items-center gap-3">
              <Flame size={22} /> {p}
            </span>
          ))}
        </div>
        <style>{`@keyframes scroll { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-14 md:py-20">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="font-display font-black text-3xl md:text-5xl text-center">PERGUNTAS <span className="text-brand">FREQUENTES</span></h2>
          <Accordion type="single" collapsible className="mt-6">
            {activeFaqs.map((f, i) => (
              <AccordionItem key={"id" in f ? f.id : i} value={`f${i}`} className="border-white/10">
                <AccordionTrigger className="text-left font-display font-semibold text-base hover:no-underline">
                  {"question" in f ? f.question : f.q}
                </AccordionTrigger>
                <AccordionContent className="text-white/70 text-sm">{"answer" in f ? f.answer : f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-14 bg-ink text-center px-4">
        <h3 className="font-display font-black text-3xl md:text-5xl">PRONTO PARA <span className="text-brand">DESCOBRIR</span>?</h3>
        <p className="mt-2 text-white/70">Garanta seu pallet antes que acabe.</p>
        <a href="#pallets" className="mt-6 inline-flex h-14 items-center rounded-lg bg-brand text-brand-foreground font-display font-bold px-8 hover:brightness-110 transition shadow-[0_10px_30px_-10px_#FF6B00]">
          COMPRAR PALLET AGORA
        </a>
      </section>

      {/* FOOTER */}
      <footer className="bg-black border-t border-white/5 pt-10 pb-8 px-4">
        <div className="mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <div>
            <div className="font-display font-extrabold text-base">PALLETS<span className="text-brand">SURPRESA</span></div>
            <p className="mt-2 text-white/60 text-xs">Logística reversa, devoluções e excesso de estoque. Surpresa em cada pallet.</p>
          </div>
          <div>
            <div className="font-display font-bold mb-2">Empresa</div>
            <ul className="space-y-1 text-white/60">
              <li>Sobre</li><li>Blog</li><li>Carreiras</li>
            </ul>
          </div>
          <div>
            <div className="font-display font-bold mb-2">Suporte</div>
            <ul className="space-y-1 text-white/60">
              <li>Contato</li><li>WhatsApp</li><li>Central de ajuda</li>
            </ul>
          </div>
          <div>
            <div className="font-display font-bold mb-2">Legal</div>
            <ul className="space-y-1 text-white/60">
              <li>Políticas</li><li>Termos</li><li>Privacidade</li>
            </ul>
          </div>
        </div>
        <div className="mx-auto max-w-6xl mt-8 pt-6 border-t border-white/5 text-xs text-white/50 flex flex-col md:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} Pallets Surpresa. CNPJ 00.000.000/0001-00</span>
          <span>Logística reversa registrada.</span>
        </div>
      </footer>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-ink/95 backdrop-blur border-t border-white/10">
        <ul className="grid grid-cols-5">
          {[
            { icon: Home, label: "Início", href: "#top" },
            { icon: Boxes, label: "Pallets", href: "#pallets" },
            { icon: Film, label: "Unboxings", href: "#unboxings" },
            { icon: HelpCircle, label: "FAQ", href: "#faq" },
            { icon: ShoppingCart, label: "Comprar", href: "#pallets", primary: true },
          ].map(({ icon: Icon, label, href, primary }) => (
            <li key={label}>
              <a href={href} className={`flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-display font-semibold ${primary ? "text-brand" : "text-white/70"}`}>
                <Icon size={20} />
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

function highlightDiscover(text: string) {
  const marker = "DESCUBRA";
  const index = text.toUpperCase().indexOf(marker);
  if (index < 0) return text;
  return <>{text.slice(0, index)}<span className="text-brand">{text.slice(index, index + marker.length)}</span>{text.slice(index + marker.length)}</>;
}

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);
}

CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text,
  phone text,
  city text,
  state text,
  document text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage customers" ON public.customers;
CREATE POLICY "Admins can manage customers" ON public.customers FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE DEFAULT ('PED-' || upper(substr(gen_random_uuid()::text, 1, 8))),
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  pallet_id uuid REFERENCES public.pallets(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_email text,
  customer_phone text,
  pallet_name text NOT NULL,
  total_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'novo' CHECK (status IN ('novo','aguardando_pagamento','pago','em_separacao','enviado','entregue','cancelado')),
  payment_method text,
  tracking_code text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage orders" ON public.orders;
CREATE POLICY "Admins can manage orders" ON public.orders FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.site_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  video_url text,
  thumbnail_url text,
  customer_handle text,
  views_label text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_videos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_videos TO authenticated;
GRANT ALL ON public.site_videos TO service_role;
ALTER TABLE public.site_videos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Active videos are publicly readable" ON public.site_videos;
CREATE POLICY "Active videos are publicly readable" ON public.site_videos FOR SELECT TO public USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can insert videos" ON public.site_videos;
CREATE POLICY "Admins can insert videos" ON public.site_videos FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can update videos" ON public.site_videos;
CREATE POLICY "Admins can update videos" ON public.site_videos FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can delete videos" ON public.site_videos;
CREATE POLICY "Admins can delete videos" ON public.site_videos FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  city text,
  content text NOT NULL,
  rating integer NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  avatar_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.testimonials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Active testimonials are publicly readable" ON public.testimonials;
CREATE POLICY "Active testimonials are publicly readable" ON public.testimonials FOR SELECT TO public USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can insert testimonials" ON public.testimonials;
CREATE POLICY "Admins can insert testimonials" ON public.testimonials FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can update testimonials" ON public.testimonials;
CREATE POLICY "Admins can update testimonials" ON public.testimonials FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can delete testimonials" ON public.testimonials;
CREATE POLICY "Admins can delete testimonials" ON public.testimonials FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.faq_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.faq_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.faq_items TO authenticated;
GRANT ALL ON public.faq_items TO service_role;
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Active FAQ items are publicly readable" ON public.faq_items;
CREATE POLICY "Active FAQ items are publicly readable" ON public.faq_items FOR SELECT TO public USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can insert FAQ items" ON public.faq_items;
CREATE POLICY "Admins can insert FAQ items" ON public.faq_items FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can update FAQ items" ON public.faq_items;
CREATE POLICY "Admins can update FAQ items" ON public.faq_items FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can delete FAQ items" ON public.faq_items;
CREATE POLICY "Admins can delete FAQ items" ON public.faq_items FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  image_url text,
  cta_label text,
  cta_url text,
  placement text NOT NULL DEFAULT 'hero' CHECK (placement IN ('hero','top','middle','bottom')),
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.banners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.banners TO authenticated;
GRANT ALL ON public.banners TO service_role;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Active banners are publicly readable" ON public.banners;
CREATE POLICY "Active banners are publicly readable" ON public.banners FOR SELECT TO public USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can insert banners" ON public.banners;
CREATE POLICY "Admins can insert banners" ON public.banners FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can update banners" ON public.banners;
CREATE POLICY "Admins can update banners" ON public.banners FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can delete banners" ON public.banners;
CREATE POLICY "Admins can delete banners" ON public.banners FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name text NOT NULL DEFAULT 'Pallets Surpresa',
  whatsapp text,
  email text,
  instagram_url text,
  checkout_url text,
  hero_title text,
  hero_subtitle text,
  announcement text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Settings are publicly readable" ON public.site_settings;
CREATE POLICY "Settings are publicly readable" ON public.site_settings FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Admins can insert settings" ON public.site_settings;
CREATE POLICY "Admins can insert settings" ON public.site_settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can update settings" ON public.site_settings;
CREATE POLICY "Admins can update settings" ON public.site_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can delete settings" ON public.site_settings;
CREATE POLICY "Admins can delete settings" ON public.site_settings FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS set_customers_updated_at ON public.customers;
CREATE TRIGGER set_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS set_site_videos_updated_at ON public.site_videos;
CREATE TRIGGER set_site_videos_updated_at BEFORE UPDATE ON public.site_videos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS set_testimonials_updated_at ON public.testimonials;
CREATE TRIGGER set_testimonials_updated_at BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS set_faq_items_updated_at ON public.faq_items;
CREATE TRIGGER set_faq_items_updated_at BEFORE UPDATE ON public.faq_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS set_banners_updated_at ON public.banners;
CREATE TRIGGER set_banners_updated_at BEFORE UPDATE ON public.banners FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS set_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER set_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.site_settings (site_name, whatsapp, email, hero_title, hero_subtitle, announcement)
SELECT 'Pallets Surpresa', '', '', 'COMPRE PALLETS SURPRESA E DESCUBRA O QUE ESTÁ ESCONDIDO', 'Produtos de logística reversa, devoluções e excesso de estoque. Cada pallet é uma nova oportunidade.', 'ESTOQUE LIMITADO HOJE'
WHERE NOT EXISTS (SELECT 1 FROM public.site_settings);
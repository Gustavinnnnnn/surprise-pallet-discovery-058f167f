
CREATE TABLE public.pallet_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.pallet_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pallet_categories TO authenticated;
GRANT ALL ON public.pallet_categories TO service_role;

ALTER TABLE public.pallet_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Visitors can read active categories" ON public.pallet_categories
  FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admins can read all categories" ON public.pallet_categories
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert categories" ON public.pallet_categories
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update categories" ON public.pallet_categories
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete categories" ON public.pallet_categories
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER pallet_categories_set_updated_at BEFORE UPDATE ON public.pallet_categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.pallets
  ADD COLUMN category_id uuid REFERENCES public.pallet_categories(id) ON DELETE SET NULL;

CREATE INDEX pallets_category_id_idx ON public.pallets(category_id);

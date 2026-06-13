ALTER TABLE public.site_settings 
  ADD COLUMN IF NOT EXISTS tribopay_offer_hash TEXT,
  ADD COLUMN IF NOT EXISTS tribopay_product_hash TEXT;
ALTER TABLE public.pallets
  ADD COLUMN IF NOT EXISTS tribopay_offer_hash TEXT,
  ADD COLUMN IF NOT EXISTS tribopay_product_hash TEXT;
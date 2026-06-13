GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

DROP POLICY IF EXISTS "Active pallets are publicly readable" ON public.pallets;
CREATE POLICY "Visitors can read active pallets"
ON public.pallets
FOR SELECT
TO anon, authenticated
USING (is_active = true);
CREATE POLICY "Admins can read all pallets"
ON public.pallets
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Active banners are publicly readable" ON public.banners;
CREATE POLICY "Visitors can read active banners"
ON public.banners
FOR SELECT
TO anon, authenticated
USING (is_active = true);
CREATE POLICY "Admins can read all banners"
ON public.banners
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Active videos are publicly readable" ON public.site_videos;
CREATE POLICY "Visitors can read active videos"
ON public.site_videos
FOR SELECT
TO anon, authenticated
USING (is_active = true);
CREATE POLICY "Admins can read all videos"
ON public.site_videos
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Active testimonials are publicly readable" ON public.testimonials;
CREATE POLICY "Visitors can read active testimonials"
ON public.testimonials
FOR SELECT
TO anon, authenticated
USING (is_active = true);
CREATE POLICY "Admins can read all testimonials"
ON public.testimonials
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Active FAQ items are publicly readable" ON public.faq_items;
CREATE POLICY "Visitors can read active FAQ items"
ON public.faq_items
FOR SELECT
TO anon, authenticated
USING (is_active = true);
CREATE POLICY "Admins can read all FAQ items"
ON public.faq_items
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Visitors can view media" ON storage.objects;
CREATE POLICY "Visitors can view media"
ON storage.objects
FOR SELECT
TO anon
USING (bucket_id = 'media');
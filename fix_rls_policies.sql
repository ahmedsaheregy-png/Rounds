-- ============================================
-- إصلاح سياسات RLS لمشروع Rounds
-- ============================================
-- قم بتنفيذ هذا الكود في Supabase SQL Editor
-- https://supabase.com/dashboard/project/antzuhakwgyuswjipmnf/sql

-- ============================================
-- 1. سياسات جدول reservations
-- ============================================

-- السماح بالقراءة للجميع (anon)
CREATE POLICY "Allow public read access on reservations"
ON public.reservations
FOR SELECT
USING (true);

-- السماح بالإضافة للجميع (للحجز الجديد)
CREATE POLICY "Allow public insert on reservations"
ON public.reservations
FOR INSERT
WITH CHECK (true);

-- السماح بالتحديث للجميع (لتحديث الصورة)
CREATE POLICY "Allow public update on reservations"
ON public.reservations
FOR UPDATE
USING (true)
WITH CHECK (true);

-- السماح بالحذف للجميع (للإدارة)
CREATE POLICY "Allow public delete on reservations"
ON public.reservations
FOR DELETE
USING (true);

-- ============================================
-- 2. سياسات جدول settings
-- ============================================

-- السماح بالقراءة للجميع
CREATE POLICY "Allow public read access on settings"
ON public.settings
FOR SELECT
USING (true);

-- السماح بالتحديث للجميع (للإدارة)
CREATE POLICY "Allow public update on settings"
ON public.settings
FOR UPDATE
USING (true)
WITH CHECK (true);

-- ============================================
-- 3. سياسات Storage Bucket "Rounds"
-- ============================================
-- ملاحظة: يجب تنفيذ هذا من خلال Supabase Dashboard
-- Storage > Policies
-- أو من خلال SQL:

-- السماح برفع الملفات للجميع
CREATE POLICY "Allow public upload to Rounds bucket"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'Rounds');

-- السماح بقراءة الملفات للجميع
CREATE POLICY "Allow public read from Rounds bucket"
ON storage.objects
FOR SELECT
USING (bucket_id = 'Rounds');

-- السماح بتحديث الملفات (upsert)
CREATE POLICY "Allow public update in Rounds bucket"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'Rounds')
WITH CHECK (bucket_id = 'Rounds');

-- ============================================
-- إذا كانت السياسات موجودة مسبقاً، استخدم DROP أولاً:
-- ============================================
/*
DROP POLICY IF EXISTS "Allow public read access on reservations" ON public.reservations;
DROP POLICY IF EXISTS "Allow public insert on reservations" ON public.reservations;
DROP POLICY IF EXISTS "Allow public update on reservations" ON public.reservations;
DROP POLICY IF EXISTS "Allow public delete on reservations" ON public.reservations;

DROP POLICY IF EXISTS "Allow public read access on settings" ON public.settings;
DROP POLICY IF EXISTS "Allow public update on settings" ON public.settings;

DROP POLICY IF EXISTS "Allow public upload to Rounds bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read from Rounds bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update in Rounds bucket" ON storage.objects;
*/

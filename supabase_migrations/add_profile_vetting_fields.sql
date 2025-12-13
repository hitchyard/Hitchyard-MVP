ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS zip_code text,
  ADD COLUMN IF NOT EXISTS cargo_policy text,
  ADD COLUMN IF NOT EXISTS auto_policy text,
  ADD COLUMN IF NOT EXISTS salt_lake_area_check boolean DEFAULT FALSE;

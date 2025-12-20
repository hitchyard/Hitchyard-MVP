-- Add Ansonia Credit API integration fields to user_profiles
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS mc_number TEXT,
  ADD COLUMN IF NOT EXISTS dot_number TEXT,
  ADD COLUMN IF NOT EXISTS ansonia_credit_score INTEGER,
  ADD COLUMN IF NOT EXISTS ansonia_dtp_days INTEGER,
  ADD COLUMN IF NOT EXISTS ansonia_last_checked TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS vetting_review_flag TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS vetting_review_reason TEXT DEFAULT NULL;

-- Create index for faster lookups during vetting review
CREATE INDEX IF NOT EXISTS idx_user_profiles_vetting_review_flag
  ON public.user_profiles(vetting_review_flag)
  WHERE vetting_review_flag IS NOT NULL;

-- Create index for trust_score lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_trust_score_status
  ON public.user_profiles(trust_score, vetting_status);

-- Update vetting_status to support REJECTED
-- Note: If your vetting_status column has a CHECK constraint, you may need to update it:
-- ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_vetting_status_check;
-- ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_vetting_status_check
--   CHECK (vetting_status IN ('PENDING', 'ACTIVE', 'REJECTED'));

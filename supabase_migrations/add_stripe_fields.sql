-- Migration: Add Stripe payment fields to user_profiles, loads, and bids tables
-- Created: 2025-12-08
-- Purpose: Enable Stripe payment processing for bid acceptance

-- Add Stripe fields to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_payment_method_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;

-- Add payment tracking to loads table
ALTER TABLE loads 
ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;

-- Add payment tracking to bids table
ALTER TABLE bids 
ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_customer_id ON user_profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_account_id ON user_profiles(stripe_account_id);
CREATE INDEX IF NOT EXISTS idx_loads_payment_intent_id ON loads(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_bids_payment_intent_id ON bids(payment_intent_id);

-- Add comments for documentation
COMMENT ON COLUMN user_profiles.stripe_customer_id IS 'Stripe Customer ID for shippers to process payments';
COMMENT ON COLUMN user_profiles.stripe_payment_method_id IS 'Default payment method ID for shipper payments';
COMMENT ON COLUMN user_profiles.stripe_account_id IS 'Stripe Connect Account ID for carriers to receive payouts';
COMMENT ON COLUMN loads.payment_intent_id IS 'Stripe Payment Intent ID for tracking load payments';
COMMENT ON COLUMN bids.payment_intent_id IS 'Stripe Payment Intent ID associated with accepted bid';

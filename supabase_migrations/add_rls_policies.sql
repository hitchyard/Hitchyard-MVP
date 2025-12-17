-- =================================================================
-- HITCHYARD RLS (ROW LEVEL SECURITY) POLICIES
-- Secure Access Control for Shipper vs Carrier Roles
-- =================================================================

-- Enable RLS on loads table
ALTER TABLE loads ENABLE ROW LEVEL SECURITY;

-- Enable RLS on bids table
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- =================================================================
-- LOADS TABLE POLICIES
-- =================================================================

-- POLICY: Shippers can INSERT their own loads
CREATE POLICY "shippers_can_insert_loads"
ON loads
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.user_id = auth.uid()
    AND user_profiles.role = 'shipper'
  )
  AND user_id = auth.uid()
);

-- POLICY: Shippers can SELECT loads they posted
CREATE POLICY "shippers_can_select_own_loads"
ON loads
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.user_id = auth.uid()
    AND user_profiles.role = 'shipper'
  )
);

-- POLICY: Shippers can UPDATE loads they posted
CREATE POLICY "shippers_can_update_own_loads"
ON loads
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.user_id = auth.uid()
    AND user_profiles.role = 'shipper'
  )
)
WITH CHECK (
  user_id = auth.uid()
);

-- POLICY: Carriers can SELECT all public/available loads
CREATE POLICY "carriers_can_select_public_loads"
ON loads
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.user_id = auth.uid()
    AND user_profiles.role = 'carrier'
  )
  AND status IN ('available', 'open', 'pending')
);

-- =================================================================
-- BIDS TABLE POLICIES
-- =================================================================

-- POLICY: Carriers can INSERT bids on available loads
CREATE POLICY "carriers_can_insert_bids"
ON bids
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.user_id = auth.uid()
    AND user_profiles.role = 'carrier'
  )
  AND carrier_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM loads
    WHERE loads.id = load_id
    AND loads.status IN ('available', 'open', 'pending')
  )
);

-- POLICY: Carriers can SELECT their own bids
CREATE POLICY "carriers_can_select_own_bids"
ON bids
FOR SELECT
TO authenticated
USING (
  carrier_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.user_id = auth.uid()
    AND user_profiles.role = 'carrier'
  )
);

-- POLICY: Shippers can SELECT bids on their loads
CREATE POLICY "shippers_can_select_bids_on_own_loads"
ON bids
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM loads
    WHERE loads.id = load_id
    AND loads.user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.user_id = auth.uid()
    AND user_profiles.role = 'shipper'
  )
);

-- POLICY: Shippers can UPDATE bids on their loads (for accepting/rejecting)
CREATE POLICY "shippers_can_update_bids_on_own_loads"
ON bids
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM loads
    WHERE loads.id = load_id
    AND loads.user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.user_id = auth.uid()
    AND user_profiles.role = 'shipper'
  )
);

-- =================================================================
-- NOTES:
-- =================================================================
-- 1. These policies assume a `role` column exists in `user_profiles` table
--    with values: 'shipper' or 'carrier'
-- 
-- 2. Load statuses should include: 'available', 'open', 'pending', 'assigned', 'completed'
--
-- 3. To apply these policies, run this SQL in your Supabase SQL Editor:
--    Dashboard > SQL Editor > New Query > Paste & Run
--
-- 4. Verify policies:
--    SELECT * FROM pg_policies WHERE tablename IN ('loads', 'bids');
-- =================================================================

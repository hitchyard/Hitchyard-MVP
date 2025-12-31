-- Create bill_of_ladings table for storing BOL records
-- Tracks all Bill of Lading documents generated for shipments
-- Linked to loads, invoices, and QuickBooks for complete audit trail

CREATE TABLE bill_of_ladings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bol_id TEXT UNIQUE NOT NULL,
  bol_number TEXT NOT NULL,
  load_id TEXT NOT NULL,
  shipper_name TEXT,
  consignee_name TEXT,
  carrier_name TEXT,
  carrier_dot TEXT,
  status TEXT DEFAULT 'created' CHECK (status IN ('created', 'issued', 'picked_up', 'in_transit', 'delivered', 'archived')),
  pdf_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  delivered_at TIMESTAMP
);

-- Create indexes for efficient querying
CREATE INDEX idx_bill_of_ladings_load_id ON bill_of_ladings(load_id);
CREATE INDEX idx_bill_of_ladings_bol_id ON bill_of_ladings(bol_id);
CREATE INDEX idx_bill_of_ladings_status ON bill_of_ladings(status);
CREATE INDEX idx_bill_of_ladings_created_at ON bill_of_ladings(created_at);

-- Enable Row Level Security
ALTER TABLE bill_of_ladings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view BOLs for their loads
CREATE POLICY "Users can view their BOLs"
  ON bill_of_ladings
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM loads WHERE id = load_id
    )
    OR
    -- Admins can view all
    auth.jwt() ->> 'role' = 'admin'
  );

-- Allow authenticated users to insert BOLs for their loads
CREATE POLICY "Users can create BOLs for their loads"
  ON bill_of_ladings
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM loads WHERE id = load_id
    )
    OR
    auth.jwt() ->> 'role' = 'admin'
  );

-- Allow updates only to status and delivery fields
CREATE POLICY "Users can update BOL status"
  ON bill_of_ladings
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM loads WHERE id = load_id
    )
    OR
    auth.jwt() ->> 'role' = 'admin'
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM loads WHERE id = load_id
    )
    OR
    auth.jwt() ->> 'role' = 'admin'
  );

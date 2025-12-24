-- Create the applicants table for Hitchyard Vetting
CREATE TABLE IF NOT EXISTS applicants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  company_name text NOT NULL,
  email text NOT NULL,
  mc_number text NOT NULL,
  status text NOT NULL
);

-- Enable Row Level Security (Optional but recommended)
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows the service role (Vercel) to insert data
CREATE POLICY "Enable insert for service role only" ON applicants
  FOR INSERT
  WITH CHECK (true);

-- Create a policy for you to view the data in the dashboard
CREATE POLICY "Enable read for authenticated users" ON applicants
  FOR SELECT
  USING (auth.role() = 'authenticated');

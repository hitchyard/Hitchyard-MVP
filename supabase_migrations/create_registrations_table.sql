-- Create registrations table for storing user registration data
CREATE TABLE registrations (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_type TEXT NOT NULL,
  full_name TEXT NOT NULL,
  company_email TEXT UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  compliance_date DATE DEFAULT '2025-01-02'::date
);

-- Indexing for performance
CREATE UNIQUE INDEX idx_registrations_email ON registrations (company_email);
CREATE INDEX idx_registrations_user_type ON registrations (user_type);

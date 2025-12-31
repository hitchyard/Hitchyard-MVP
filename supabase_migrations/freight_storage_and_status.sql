-- 1. Setup Storage Permissions
INSERT INTO storage.buckets (id, name, public) 
VALUES ('freight-documents', 'freight-documents', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public View" ON storage.objects FOR SELECT USING (bucket_id = 'freight-documents');
CREATE POLICY "Auth Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'freight-documents' AND auth.role() = 'authenticated');

-- 2. Ensure Load Tracking (status column for BOL lifecycle)
ALTER TABLE bill_of_ladings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'GENERATED';

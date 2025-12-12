// lib/supabaseClient.ts

import { createClient } from '@supabase/supabase-js';

// **NEW:** Check for standard server variables first, then fallback to NEXT_PUBLIC
// This ensures they are available both on the server (build) and client (runtime)
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // This error message is what caused the build failure.
  // We keep it to ensure security if keys are truly missing.
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

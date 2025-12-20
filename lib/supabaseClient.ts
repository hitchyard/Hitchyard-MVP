// lib/supabaseClient.ts
// Secure Supabase client with environment validation for Vercel deployment

import { createClient } from '@supabase/supabase-js';

/**
 * Validates and retrieves Supabase environment variables
 * Logs clear errors to console instead of crashing the app
 */
function getSupabaseEnv() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const missingVars = [];
  if (!supabaseUrl) missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!supabaseAnonKey) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  if (missingVars.length > 0) {
    console.error('❌ SUPABASE CONFIGURATION ERROR:');
    console.error(`   Missing required environment variables: ${missingVars.join(', ')}`);
    console.error('   Please add these to your Vercel Environment Variables:');
    console.error('   1. Go to Vercel Dashboard → Project → Settings → Environment Variables');
    console.error('   2. Add NEXT_PUBLIC_SUPABASE_URL with your Supabase project URL');
    console.error('   3. Add NEXT_PUBLIC_SUPABASE_ANON_KEY with your Supabase anon key');
    console.error('   4. Redeploy your application');
    
    // Return dummy values to prevent crash, but functionality will be limited
    return {
      url: 'https://placeholder.supabase.co',
      key: 'placeholder-key',
      isValid: false
    };
  }

  return {
    url: supabaseUrl,
    key: supabaseAnonKey,
    isValid: true
  };
}

const config = getSupabaseEnv();

if (!config.isValid) {
  console.warn('⚠️  Supabase client initialized with placeholder values. Database operations will fail.');
}

export const supabase = createClient(config.url, config.key);
export const isSupabaseConfigured = config.isValid;

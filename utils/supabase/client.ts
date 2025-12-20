import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;
let _configValidated = false;

/**
 * Validates Supabase environment variables with clear error messages
 * Logs to console instead of crashing the app for better debugging
 */
function validateSupabaseConfig(): { url: string; key: string; isValid: boolean } {
	if (_configValidated) {
		return {
			url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
			key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
			isValid: true
		};
	}

	const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	if (!url || !key) {
		console.error('❌ SUPABASE CONFIGURATION ERROR:');
		console.error('   Missing required environment variables for Supabase client.');
		
		if (!url) {
			console.error('   ❌ NEXT_PUBLIC_SUPABASE_URL is not defined');
		}
		if (!key) {
			console.error('   ❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined');
		}
		
		console.error('');
		console.error('   📝 How to fix this on Vercel:');
		console.error('   1. Go to: https://vercel.com/dashboard');
		console.error('   2. Select your project → Settings → Environment Variables');
		console.error('   3. Add: NEXT_PUBLIC_SUPABASE_URL = your-project-url.supabase.co');
		console.error('   4. Add: NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key');
		console.error('   5. Redeploy your application');
		console.error('');

		return {
			url: 'https://placeholder.supabase.co',
			key: 'placeholder-key',
			isValid: false
		};
	}

	_configValidated = true;
	return { url, key, isValid: true };
}

/**
 * Returns a singleton Supabase client suitable for Next.js Client Components.
 * Requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
 */
export function supabase(): SupabaseClient {
	if (!_supabase) {
		const config = validateSupabaseConfig();
		
		if (!config.isValid) {
			console.warn('⚠️  Supabase client created with placeholder values. Operations will fail.');
		}
		
		_supabase = createClient(config.url, config.key);
	}

	return _supabase;
}

export type { SupabaseClient };


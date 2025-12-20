#!/usr/bin/env node

/**
 * Supabase Environment Validation Script
 * Checks that all required Supabase environment variables are configured
 * Run this before deploying to Vercel
 */

console.log('\n' + '='.repeat(60));
console.log('🔍 SUPABASE ENVIRONMENT VALIDATION');
console.log('='.repeat(60) + '\n');

const requiredVars = [
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    description: 'Your Supabase project URL',
    example: 'https://xxxxx.supabase.co',
    isPublic: true
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    description: 'Your Supabase anon/public key',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    isPublic: true
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    description: 'Your Supabase service role key (server-side only)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    isPublic: false,
    optional: false
  }
];

let allValid = true;
const results = [];

requiredVars.forEach(variable => {
  const value = process.env[variable.name];
  const isSet = !!value;
  const isValid = isSet && value.length > 10;

  results.push({
    name: variable.name,
    isSet,
    isValid,
    description: variable.description,
    isPublic: variable.isPublic,
    optional: variable.optional
  });

  if (!isValid && !variable.optional) {
    allValid = false;
  }
});

// Display results
console.log('Environment Variables Status:\n');

results.forEach(result => {
  const icon = result.isValid ? '✅' : (result.optional ? '⚠️' : '❌');
  const status = result.isValid ? 'CONFIGURED' : (result.optional ? 'OPTIONAL' : 'MISSING');
  const visibility = result.isPublic ? '(Public)' : '(Server-only)';
  
  console.log(`${icon} ${result.name} ${visibility}`);
  console.log(`   Status: ${status}`);
  console.log(`   ${result.description}`);
  
  if (!result.isValid) {
    console.log(`   ⚠️  This variable is not configured!`);
  }
  
  console.log('');
});

console.log('='.repeat(60));

if (allValid) {
  console.log('✅ SUCCESS: All required Supabase variables are configured!\n');
  console.log('You are ready to deploy to Vercel.\n');
  process.exit(0);
} else {
  console.log('❌ ERROR: Missing required Supabase environment variables!\n');
  console.log('📝 How to fix this:\n');
  console.log('1. LOCAL DEVELOPMENT:');
  console.log('   - Create a .env.local file in your project root');
  console.log('   - Add the missing variables (see examples above)');
  console.log('   - Restart your dev server\n');
  console.log('2. VERCEL DEPLOYMENT:');
  console.log('   - Go to: https://vercel.com/dashboard');
  console.log('   - Select your project → Settings → Environment Variables');
  console.log('   - Add each missing variable for all environments');
  console.log('   - Redeploy your application\n');
  console.log('3. GET YOUR SUPABASE KEYS:');
  console.log('   - Go to: https://app.supabase.com');
  console.log('   - Select your project → Settings → API');
  console.log('   - Copy the URL and keys from the "Project API keys" section\n');
  process.exit(1);
}

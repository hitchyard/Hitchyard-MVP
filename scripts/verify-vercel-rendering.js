#!/usr/bin/env node

/**
 * Vercel Deployment Diagnostics
 * Run this to verify rendering configuration before deployment
 */

console.log('\n' + '='.repeat(70));
console.log('🎨 VERCEL RENDERING DIAGNOSTICS - HITCHYARD');
console.log('='.repeat(70) + '\n');

const checks = [];

// 1. Check Tailwind Config
console.log('📋 Checking Tailwind Configuration...\n');

try {
  const tailwindConfig = require('../tailwind.config.js');
  
  // Check Charcoal Black color
  const charcoalBlack = tailwindConfig.theme.extend.colors['charcoal-black'];
  if (charcoalBlack === '#1A1D21') {
    console.log('✅ Charcoal Black (#1A1D21) - CONFIGURED');
    checks.push({ name: 'Charcoal Black Color', status: 'pass' });
  } else {
    console.log('❌ Charcoal Black - MISSING OR INCORRECT');
    checks.push({ name: 'Charcoal Black Color', status: 'fail' });
  }
  
  // Check Cinzel font
  const serifFont = tailwindConfig.theme.extend.fontFamily['serif'];
  const cinzelFont = tailwindConfig.theme.extend.fontFamily['cinzel-bold'];
  if (serifFont && serifFont.includes('Cinzel')) {
    console.log('✅ Cinzel Font Family - CONFIGURED');
    checks.push({ name: 'Cinzel Font', status: 'pass' });
  } else {
    console.log('❌ Cinzel Font - MISSING');
    checks.push({ name: 'Cinzel Font', status: 'fail' });
  }
  
  // Check content paths
  const contentPaths = tailwindConfig.content;
  if (contentPaths.includes('./app/**/*.{js,ts,jsx,tsx,mdx}')) {
    console.log('✅ Tailwind Content Paths - CONFIGURED');
    checks.push({ name: 'Content Paths', status: 'pass' });
  } else {
    console.log('⚠️  Tailwind Content Paths - May need verification');
    checks.push({ name: 'Content Paths', status: 'warn' });
  }
  
} catch (error) {
  console.log('❌ Error loading Tailwind config:', error.message);
  checks.push({ name: 'Tailwind Config', status: 'fail' });
}

console.log('');

// 2. Check Layout.tsx for ErrorBoundary
console.log('🛡️  Checking Error Handling...\n');

const fs = require('fs');
const path = require('path');

try {
  const layoutPath = path.join(__dirname, '../app/layout.tsx');
  const layoutContent = fs.readFileSync(layoutPath, 'utf-8');
  
  if (layoutContent.includes('ErrorBoundary')) {
    console.log('✅ ErrorBoundary Component - IMPLEMENTED');
    checks.push({ name: 'ErrorBoundary', status: 'pass' });
  } else {
    console.log('❌ ErrorBoundary - MISSING');
    checks.push({ name: 'ErrorBoundary', status: 'fail' });
  }
  
  if (layoutContent.includes("'use client'")) {
    console.log('✅ Client Component Directive - PRESENT');
    checks.push({ name: 'Client Directive', status: 'pass' });
  } else {
    console.log('⚠️  Client Component Directive - MISSING');
    checks.push({ name: 'Client Directive', status: 'warn' });
  }
  
  if (layoutContent.includes('./fonts.css')) {
    console.log('✅ Fonts CSS Import - PRESENT');
    checks.push({ name: 'Fonts Import', status: 'pass' });
  } else {
    console.log('⚠️  Fonts CSS Import - May be missing');
    checks.push({ name: 'Fonts Import', status: 'warn' });
  }
  
} catch (error) {
  console.log('❌ Error reading layout.tsx:', error.message);
  checks.push({ name: 'Layout File', status: 'fail' });
}

console.log('');

// 3. Check Page.tsx for Suspense
console.log('⏳ Checking Suspense Boundaries...\n');

try {
  const pagePath = path.join(__dirname, '../app/page.tsx');
  const pageContent = fs.readFileSync(pagePath, 'utf-8');
  
  if (pageContent.includes('Suspense')) {
    console.log('✅ Suspense Boundary - IMPLEMENTED');
    checks.push({ name: 'Suspense', status: 'pass' });
  } else {
    console.log('❌ Suspense Boundary - MISSING');
    checks.push({ name: 'Suspense', status: 'fail' });
  }
  
  if (pageContent.includes('CarrierSignupButton')) {
    console.log('✅ Carrier Signup Component - WRAPPED');
    checks.push({ name: 'Carrier Component', status: 'pass' });
  } else {
    console.log('⚠️  Carrier Signup Component - May not be wrapped');
    checks.push({ name: 'Carrier Component', status: 'warn' });
  }
  
} catch (error) {
  console.log('❌ Error reading page.tsx:', error.message);
  checks.push({ name: 'Page File', status: 'fail' });
}

console.log('');

// 4. Check CSS files
console.log('🎨 Checking CSS Configuration...\n');

try {
  const globalsCssPath = path.join(__dirname, '../app/globals.css');
  const globalsCss = fs.readFileSync(globalsCssPath, 'utf-8');
  
  if (globalsCss.includes('Cinzel:wght@400;700')) {
    console.log('✅ Cinzel Bold Font (700) - IMPORTED');
    checks.push({ name: 'Cinzel Bold Weight', status: 'pass' });
  } else {
    console.log('❌ Cinzel Bold Weight - MISSING');
    checks.push({ name: 'Cinzel Bold Weight', status: 'fail' });
  }
  
  if (globalsCss.includes('#1A1D21')) {
    console.log('✅ Charcoal Black in CSS Variables - DEFINED');
    checks.push({ name: 'CSS Variables', status: 'pass' });
  } else {
    console.log('⚠️  Charcoal Black CSS Variable - May be missing');
    checks.push({ name: 'CSS Variables', status: 'warn' });
  }
  
} catch (error) {
  console.log('⚠️  Could not verify CSS files:', error.message);
  checks.push({ name: 'CSS Files', status: 'warn' });
}

console.log('');
console.log('='.repeat(70));

// Summary
const passed = checks.filter(c => c.status === 'pass').length;
const warned = checks.filter(c => c.status === 'warn').length;
const failed = checks.filter(c => c.status === 'fail').length;

console.log('\n📊 DIAGNOSTIC SUMMARY:\n');
console.log(`   ✅ Passed: ${passed}`);
console.log(`   ⚠️  Warnings: ${warned}`);
console.log(`   ❌ Failed: ${failed}`);
console.log(`   📝 Total Checks: ${checks.length}\n`);

// 5. Check build output directory expectations
console.log('📦 Checking build output directory expectations...\n');
try {
  const fs = require('fs');
  const path = require('path');
  const nextDir = path.join(__dirname, '..', '.next');
  const distDir = path.join(__dirname, '..', 'dist');

  const hasNext = fs.existsSync(nextDir);
  const hasDist = fs.existsSync(distDir);

  if (hasNext) {
    console.log('✅ .next directory present (Next.js default)');
    checks.push({ name: 'Next Output (.next)', status: 'pass' });
  } else {
    console.log('❌ .next directory missing after build');
    checks.push({ name: 'Next Output (.next)', status: 'fail' });
  }

  if (hasDist) {
    console.log('⚠️  Found dist directory — ensure Vercel is not configured to use it.');
    checks.push({ name: 'Dist Directory Present', status: 'warn' });
  } else {
    console.log('✅ No dist directory detected (expected for Next.js)');
    checks.push({ name: 'Dist Directory Absent', status: 'pass' });
  }
} catch (error) {
  console.log('⚠️  Could not verify output directories:', error.message);
  checks.push({ name: 'Output Directory Check', status: 'warn' });
}

if (failed === 0) {
  console.log('✅ ALL CRITICAL CHECKS PASSED - Ready for Vercel deployment!\n');
  console.log('🚀 Next Steps:');
  console.log('   1. Run: npm run build (test build locally)');
  console.log('   2. Commit and push to trigger Vercel deployment');
  console.log('   3. Monitor Vercel build logs for any issues\n');
  process.exit(0);
} else {
  console.log('❌ SOME CHECKS FAILED - Please fix issues before deploying\n');
  console.log('🔧 Recommendations:');
  console.log('   1. Review failed checks above');
  console.log('   2. Verify file paths and imports');
  console.log('   3. Re-run this diagnostic after fixes\n');
  process.exit(1);
}

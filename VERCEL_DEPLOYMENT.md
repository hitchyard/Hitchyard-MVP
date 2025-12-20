# Vercel Deployment Guide - Supabase Configuration

## 🚀 Quick Deployment Checklist

### ✅ Pre-Deployment Steps

1. **Validate Environment Variables Locally**
   ```bash
   npm run validate:env
   ```

2. **Test Build Locally**
   ```bash
   npm run build
   ```

3. **If everything passes, proceed to Vercel deployment**

---

## 🔐 Required Environment Variables

Add these to your Vercel project **before deploying**:

### 1. NEXT_PUBLIC_SUPABASE_URL
- **Value:** `https://your-project-id.supabase.co`
- **Where to find:** Supabase Dashboard → Project → Settings → API → Project URL
- **Visibility:** Public (accessible in browser)
- **Required for:** All Supabase client operations

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long JWT token)
- **Where to find:** Supabase Dashboard → Project → Settings → API → Project API keys → `anon` `public`
- **Visibility:** Public (accessible in browser)
- **Required for:** Client-side authentication and queries

### 3. SUPABASE_SERVICE_ROLE_KEY
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long JWT token)
- **Where to find:** Supabase Dashboard → Project → Settings → API → Project API keys → `service_role` `secret`
- **Visibility:** Server-only (NEVER expose to client)
- **Required for:** Server-side admin operations (user registration)

---

## 📝 How to Add Variables to Vercel

### Option 1: Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **Hitchyard-MVP** project
3. Click **Settings** → **Environment Variables**
4. Add each variable:
   - Variable Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: (paste your URL)
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Click **Save**
5. Repeat for all 3 variables
6. **Redeploy** your application

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Link to your project
vercel link

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production

# Redeploy
vercel --prod
```

---

## 🛠️ Troubleshooting

### Build Fails with "Missing Supabase environment variables"

**Solution:**
1. Check that all 3 variables are added in Vercel
2. Ensure variable names are **exact** (case-sensitive)
3. Verify no extra spaces in values
4. Redeploy after adding variables

### App Loads but Shows Console Errors

**Check the Console:**
- ❌ Red errors = Variables missing or incorrect
- ⚠️ Yellow warnings = Variables present but operations may fail
- ✅ No errors = Configuration is correct

### How to Test in Local Development

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Supabase values in `.env.local`

3. Validate:
   ```bash
   npm run validate:env
   ```

4. Start dev server:
   ```bash
   npm run dev
   ```

---

## 🔒 Security Best Practices

✅ **DO:**
- Store `service_role` key only in environment variables
- Use `anon` key for client-side operations
- Enable Row Level Security (RLS) on all tables
- Rotate keys if they're ever exposed

❌ **DON'T:**
- Commit `.env.local` to Git (already in `.gitignore`)
- Share `service_role` key publicly
- Use `service_role` key in client-side code
- Hardcode keys in source files

---

## 📊 Environment Variable Validation

The app now includes **automatic validation** that:
- ✅ Logs clear errors instead of crashing
- ✅ Shows exactly which variables are missing
- ✅ Provides step-by-step fix instructions
- ✅ Validates during build (catches issues before deployment)

**Console Output Examples:**

```
❌ SUPABASE CONFIGURATION ERROR:
   Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL

   📝 How to fix this on Vercel:
   1. Go to: https://vercel.com/dashboard
   2. Select your project → Settings → Environment Variables
   3. Add: NEXT_PUBLIC_SUPABASE_URL = your-project-url.supabase.co
   4. Redeploy your application
```

---

## 🎯 Quick Commands

```bash
# Validate environment variables
npm run validate:env

# Build with validation
npm run build

# Start development server
npm run dev

# Deploy to Vercel (after adding env vars)
vercel --prod
```

---

## 📚 Additional Resources

- [Supabase Environment Setup](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

---

## ✅ Deployment Checklist

Before deploying to Vercel, ensure:

- [ ] All 3 environment variables added to Vercel
- [ ] `npm run validate:env` passes locally
- [ ] `npm run build` succeeds locally
- [ ] Row Level Security policies enabled in Supabase
- [ ] Git repo connected to Vercel project
- [ ] Deployment triggers on push to main branch

**Once complete, your Hitchyard app will be securely deployed!** 🚀

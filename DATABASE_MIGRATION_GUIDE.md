# Database Migration Guide - Stripe Payment Fields

## ✅ Completed Steps

1. **Stripe Library Installed** ✓
   - `npm install stripe` completed successfully
   - 20 packages added

2. **Migration File Created** ✓
   - Location: `/supabase_migrations/add_stripe_fields.sql`
   - Includes all necessary columns for Stripe payment processing

3. **acceptBidAction Verified** ✓
   - Located at: `/app/loads/acceptBidAction.ts`
   - Already modified with full Stripe payment integration
   - Ready to use once database columns are added

## 📋 Next Steps: Apply Database Migration

### Option 1: Using Supabase Dashboard (Recommended for Quick Setup)

1. **Login to Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your Hitchyard-MVP project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run Migration Script**
   - Copy the contents of `supabase_migrations/add_stripe_fields.sql`
   - Paste into the SQL editor
   - Click "Run" or press Cmd/Ctrl + Enter

4. **Verify Changes**
   - Go to "Table Editor" → "user_profiles"
   - Confirm new columns exist:
     - `stripe_customer_id`
     - `stripe_payment_method_id`
     - `stripe_account_id`
   - Check "loads" table for `payment_intent_id`
   - Check "bids" table for `payment_intent_id`

### Option 2: Using Supabase CLI (For Version Control)

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Create migration
supabase migration new add_stripe_fields

# Copy the SQL to the created migration file
# Then apply the migration
supabase db push
```

### Option 3: Using Direct Database Connection

If you have direct PostgreSQL access:

```bash
# Connect to your database
psql YOUR_DATABASE_CONNECTION_STRING

# Run the migration file
\i supabase_migrations/add_stripe_fields.sql

# Or copy-paste the SQL directly
```

## 🔍 Database Schema Changes

### user_profiles Table
```sql
-- New columns added:
stripe_customer_id          TEXT     -- For charging shippers
stripe_payment_method_id    TEXT     -- Default payment method
stripe_account_id           TEXT     -- For paying carriers (already exists)
```

### loads Table
```sql
-- New column added:
payment_intent_id           TEXT     -- Tracks Stripe payment
```

### bids Table
```sql
-- New column added:
payment_intent_id           TEXT     -- Links bid to payment
```

## ✅ Verification Checklist

After running the migration, verify:

- [ ] All columns created successfully
- [ ] No error messages in SQL execution
- [ ] Indexes created for performance
- [ ] Column comments added (optional, for documentation)
- [ ] Existing data not affected
- [ ] Application can read/write to new columns

## 🧪 Test the Integration

Once migration is complete:

1. **Test Carrier Setup** (Already Working)
   - Carrier navigates to dashboard
   - Sees PayoutSetupBanner
   - Completes Stripe Connect onboarding
   - `stripe_account_id` saved to database

2. **Test Shipper Setup** (Needs Implementation)
   - Create action to add payment method
   - Save `stripe_customer_id` and `stripe_payment_method_id`
   
3. **Test Bid Acceptance**
   - Shipper accepts a carrier's bid
   - Payment processes through Stripe
   - Load status updates to "assigned"
   - `payment_intent_id` saved to database

## 🚨 Troubleshooting

**Error: "column already exists"**
- The `IF NOT EXISTS` clause should prevent this
- Safe to ignore if columns already exist

**Error: "permission denied"**
- Ensure you have admin/owner access to the database
- May need to use service role key instead of anon key

**Error: "relation 'user_profiles' does not exist"**
- Table name might be different in your schema
- Check actual table names in Supabase dashboard

## 📝 Rollback (If Needed)

If you need to undo the migration:

```sql
-- Remove added columns
ALTER TABLE user_profiles 
DROP COLUMN IF EXISTS stripe_customer_id,
DROP COLUMN IF EXISTS stripe_payment_method_id;

ALTER TABLE loads 
DROP COLUMN IF EXISTS payment_intent_id;

ALTER TABLE bids 
DROP COLUMN IF EXISTS payment_intent_id;

-- Drop indexes
DROP INDEX IF EXISTS idx_user_profiles_stripe_customer_id;
DROP INDEX IF EXISTS idx_user_profiles_stripe_account_id;
DROP INDEX IF EXISTS idx_loads_payment_intent_id;
DROP INDEX IF EXISTS idx_bids_payment_intent_id;
```

## 🔐 Security Notes

- Never commit Stripe secret keys to version control
- Use environment variables for all sensitive data
- The `stripe_payment_method_id` is just a reference - actual card data stays in Stripe
- Enable Row Level Security (RLS) policies for user_profiles table

## 📚 Additional Resources

- [Supabase Migrations Docs](https://supabase.com/docs/guides/database/migrations)
- [Stripe Connect Documentation](https://stripe.com/docs/connect)
- [Payment Intents API](https://stripe.com/docs/api/payment_intents)

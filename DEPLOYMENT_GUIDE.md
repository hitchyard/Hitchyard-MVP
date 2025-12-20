# Hitchyard MVP Deployment Guide

## Supabase Edge Functions

### Prerequisites
1. Install Supabase CLI: `npm install -g supabase`
2. Login to Supabase: `supabase login`
3. Link your project: `supabase link --project-ref <your-project-ref>`

### Deploy Edge Function: check-carrier-credit

```bash
cd /workspaces/Hitchyard-MVP
supabase functions deploy check-carrier-credit
```

### Set Edge Function Environment Variables

After deployment, set these secrets in your Supabase dashboard (Settings > Edge Functions > Secrets):

```bash
# Ansonia Credit API
ANSONIA_API_URL=https://api.ansoniadata.com/v1
ANSONIA_API_KEY=your_ansonia_api_key
ANSONIA_ACCOUNT_ID=your_ansonia_account_id

# Airtable Integration (Manual Review Queue)
AIRTABLE_API_KEY=your_airtable_api_key
AIRTABLE_BASE_ID=your_airtable_base_id
AIRTABLE_TABLE_NAME=Manual Review Queue

# Supabase (automatically available)
SUPABASE_URL=<auto-injected>
SUPABASE_SERVICE_ROLE_KEY=<auto-injected>
```

### Test Edge Function

```bash
curl -i --location --request POST 'https://<your-project-ref>.supabase.co/functions/v1/check-carrier-credit' \
  --header 'Authorization: Bearer <your-anon-key>' \
  --header 'Content-Type: application/json' \
  --data '{
    "mc_number": "123456",
    "dot_number": "987654",
    "company_name": "Test Carrier LLC",
    "user_id": "<test-user-id>"
  }'
```

## Database Migrations

### Run Ansonia Vetting Fields Migration

```bash
cd /workspaces/Hitchyard-MVP
supabase db push
```

Or manually run:
```sql
-- Add Ansonia credit fields to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS mc_number TEXT,
ADD COLUMN IF NOT EXISTS ansonia_credit_score INTEGER,
ADD COLUMN IF NOT EXISTS ansonia_dtp_days INTEGER,
ADD COLUMN IF NOT EXISTS ansonia_checked_at TIMESTAMP WITH TIME ZONE;

-- Update vetting_status CHECK constraint to include REJECTED
ALTER TABLE user_profiles
DROP CONSTRAINT IF EXISTS user_profiles_vetting_status_check;

ALTER TABLE user_profiles
ADD CONSTRAINT user_profiles_vetting_status_check
CHECK (vetting_status IN ('PENDING', 'ACTIVE', 'REJECTED'));
```

## Airtable Setup

### Create Manual Review Queue Table

1. Go to your Airtable base
2. Create a new table: "Manual Review Queue"
3. Add these fields:
   - **Carrier Name** (Single line text)
   - **MC Number** (Single line text)
   - **DOT Number** (Single line text)
   - **Credit Score** (Number)
   - **Days to Pay** (Number)
   - **User ID** (Single line text)
   - **Created** (Date - auto-created)
   - **Status** (Single select: Pending Review, Approved, Rejected)
   - **Notes** (Long text)

## Environment Variables

### Next.js App (.env.local)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# Airtable
AIRTABLE_API_KEY=<your-airtable-api-key>
AIRTABLE_BASE_ID=<your-airtable-base-id>
AIRTABLE_TABLE_NAME=Manual Review Queue
```

## Testing the Complete Flow

### 1. Register a New Carrier

1. Go to `/register`
2. Fill in:
   - Email
   - Password
   - Company Name
   - MC Number (e.g., 123456)
   - DOT Number (e.g., 987654)
3. Submit registration

### 2. Verify Edge Function Execution

Check Supabase Dashboard > Edge Functions > Logs:
- Should see POST request to `/check-carrier-credit`
- Should see Ansonia API call
- Should see database update

### 3. Check Dashboard Behavior

Navigate to `/carrier-dashboard`:

**If Credit Score 85-100 (ACTIVE):**
- Should see "✓ VETTING COMPLETE" badge in nav
- Full dashboard access
- Can browse and bid on loads

**If Credit Score 70-84 (PENDING):**
- Manual review notification
- Check Airtable for new record in "Manual Review Queue"
- Limited dashboard access until manual approval

**If Credit Score <70 (REJECTED):**
- Full-screen "IMPERIAL STANDARD NOT MET" message
- Shows current trust score
- Shows minimum required score (85)
- No dashboard access

### 4. Manual Review Process (for 70-84 scores)

1. Go to Airtable "Manual Review Queue" table
2. Review carrier details (MC number, credit score, DTP)
3. Set Status:
   - **Approved**: Manually update `vetting_status = 'ACTIVE'` in Supabase
   - **Rejected**: Manually update `vetting_status = 'REJECTED'` in Supabase
4. Add notes for audit trail

### 5. Verify Real-time Updates

Dashboard should update automatically via Supabase Realtime when vetting_status changes:
- PENDING → ACTIVE: "VETTING COMPLETE" badge appears
- PENDING → REJECTED: Redirected to rejection screen
- REJECTED → ACTIVE: Full dashboard access restored

## Decision Logic

```
Ansonia Global Credit Score (0-100):
├── 85-100: ACTIVE + ✓ VETTING COMPLETE badge
├── 70-84:  PENDING + Airtable Manual Review Queue
└── <70:    REJECTED + "Imperial Standard Not Met" screen
```

## Troubleshooting

### Edge Function not triggering
- Check Supabase logs: Dashboard > Edge Functions > Logs
- Verify authorization header in API call
- Check environment variables are set

### Ansonia API errors
- Verify API credentials in Edge Function secrets
- Check MC/DOT numbers are valid
- Review Ansonia API documentation

### Dashboard not updating
- Check browser console for Realtime connection errors
- Verify user is authenticated
- Check user_profiles table has correct vetting_status

### Airtable records not creating
- Verify API key has write access
- Check base ID and table name are correct
- Review Edge Function logs for Airtable API errors

## Monitoring

### Key Metrics to Track

1. **Vetting Success Rate**: % of carriers passing (score ≥85)
2. **Manual Review Queue Size**: # of carriers with 70-84 scores
3. **Rejection Rate**: % of carriers failing (score <70)
4. **Ansonia API Response Time**: Monitor Edge Function logs
5. **Dashboard Real-time Updates**: Check Realtime connection health

### Supabase Dashboard

- **Edge Functions > Logs**: Monitor function invocations, errors, response times
- **Database > user_profiles**: Track vetting_status distribution
- **Database > Realtime**: Verify subscriptions are active

### Airtable Dashboard

- **Manual Review Queue**: Track pending reviews, approval/rejection ratios
- **Automation**: Set up notifications for new manual review records

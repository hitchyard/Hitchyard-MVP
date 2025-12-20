# Ansonia (Equifax) Credit API Integration Guide

## Overview

The Hitchyard MVP now includes automated carrier vetting via the Ansonia (Equifax) Credit API. When a new carrier registers with their EIN/DOT number, the system:

1. **Fetches Credit Score** (0-100) and Days-to-Pay (DTP) from Ansonia
2. **Maps Score to Trust Status**:
   - **score > 87** → `vetting_status = 'ACTIVE'` (auto-approved)
   - **70 ≤ score ≤ 87** → `vetting_status = 'PENDING'` with `review_flag = 'MANUAL_REVIEW_BORDERLINE'`
   - **score < 70** → `vetting_status = 'PENDING'` with `review_flag = 'GRIT_CLUB_MANUAL_REVIEW'` (requires manual review)
3. **Updates Dashboard** in real-time via Supabase subscriptions
4. **Enforces Bidding Guard** (BidModal checks `trust_score > 70`)

## Setup Instructions

### 1. Get Ansonia API Credentials

Visit [https://www.ansoniadata.com/api](https://www.ansoniadata.com/api) to:
- Register for a developer account
- Create an API application
- Copy your:
  - `API_KEY` (Bearer token)
  - `ACCOUNT_ID` (X-Account-ID header)
  - API Base URL (typically `https://api.ansoniadata.com/v1`)

### 2. Configure Environment Variables

In `.env.local`:
```env
ANSONIA_API_URL=https://api.ansoniadata.com/v1
ANSONIA_API_KEY=your-actual-api-key
ANSONIA_ACCOUNT_ID=your-actual-account-id
```

For Vercel production deployment, add these to your Vercel project settings:
```bash
vercel env add ANSONIA_API_URL
vercel env add ANSONIA_API_KEY
vercel env add ANSONIA_ACCOUNT_ID
```

### 3. Database Migration

Apply the migration to add Ansonia fields to `user_profiles`:

```bash
# Via Supabase CLI
supabase migration up

# Or manually run SQL from supabase_migrations/add_ansonia_vetting_fields.sql
```

This adds:
- `ein` (TEXT) - Employer Identification Number
- `dot_number` (TEXT) - DOT number
- `ansonia_credit_score` (INTEGER) - Credit score (0-100)
- `ansonia_dtp_days` (INTEGER) - Days to Pay average
- `ansonia_last_checked` (TIMESTAMP) - Last API check
- `vetting_review_flag` (TEXT) - Review status
- `vetting_review_reason` (TEXT) - Human-readable reason

### 4. Verify Registration Form Updates

The registration form now includes:
- **EIN** (required) - Used to fetch Ansonia credit data
- **DOT Number** (optional) - Secondary identifier

## API Flow

### Registration Endpoint: `POST /api/auth/register`

**Request:**
```json
{
  "email": "carrier@example.com",
  "password": "secure_password",
  "companyName": "Acme Trucking",
  "zipCode": "84101",
  "ein": "12-3456789",
  "dotNumber": "DOT123456",
  "cargoPolicyNumber": "CARGO-123",
  "autoLiabilityPolicyNumber": "AUTO-456"
}
```

**Process:**
1. Create Supabase user account
2. Insert profile with `vetting_status='PENDING'`, `trust_score=0`
3. Store EIN/DOT in `user_profiles`
4. **Fire-and-forget** call to Ansonia credit check endpoint

### Ansonia Credit Check: `POST /api/vetting/ansonia-credit-check`

**Internal request (called by register endpoint):**
```json
{
  "user_id": "uuid-here",
  "ein": "12-3456789",
  "dot_number": "DOT123456"
}
```

**Response:**
```json
{
  "success": true,
  "vetting_status": "ACTIVE",
  "trust_score": 91,
  "credit_score": 91,
  "dtp_days": 23,
  "review_flag": null,
  "review_reason": null
}
```

**Processing:**
1. Fetch from Ansonia API with EIN/DOT
2. Determine vetting status based on credit score
3. Update `user_profiles` with results
4. Log event to `vetting_events` table (for audit trail)

## Real-Time UI Updates

### Dashboard Real-Time Sync

The `CarrierDashboardClient` component:
- Subscribes to `user_profiles` changes via Supabase Realtime
- Updates `vettingStatus` and `trustScore` state when Ansonia results arrive
- Displays Ansonia credit score and DTP days when available
- Updates PENDING overlay immediately when status changes

**Subscription:**
```typescript
channel = supabase
  .channel('user_profiles_changes')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'user_profiles',
  }, (payload) => {
    if (payload.new.vetting_status) setVettingStatus(payload.new.vetting_status);
    if (payload.new.trust_score !== undefined) setTrustScore(payload.new.trust_score);
    if (payload.new.ansonia_credit_score !== undefined) setAnsoniaCreditScore(payload.new.ansonia_credit_score);
  })
  .subscribe();
```

### BidModal Trust Guard

The bidding modal enforces:
```typescript
if (!isVerified || trustScore <= 70) {
  // Show Imperial rejection message
  return "LOW TRUST SCORE. ASSIGNMENT DENIED.";
}
```

## Fallback Behavior

If Ansonia API is unavailable:
1. System defaults to `credit_score = 50`, `dtp_days = 45`
2. Vetting status stays `PENDING` with review flag set
3. Registration completes successfully (doesn't block user)
4. Admin reviews manually in Grit Club dashboard

## Audit & Compliance

### Logging

All vetting events logged to `vetting_events` table:
- Event type: `ANSONIA_CREDIT_CHECK`
- Credit score and DTP data
- Vetting status assigned
- Review flags set

### Manual Review Queue

Carriers flagged for manual review appear in admin dashboard:
- `vetting_review_flag = 'GRIT_CLUB_MANUAL_REVIEW'` (score < 70)
- `vetting_review_flag = 'MANUAL_REVIEW_BORDERLINE'` (70-87)
- `vetting_review_reason` provides human context

### Updating Vetting Status

Admins can manually update status:
```sql
UPDATE user_profiles
SET vetting_status = 'ACTIVE', vetting_review_flag = NULL
WHERE user_id = 'uuid-here'
AND vetting_review_reason LIKE '%borderline%';
```

## Testing

### Local Testing

1. Use test EIN: `12-3456789`
2. Test DOT: `DOT999999`
3. Ansonia sandbox credentials in `.env.local`
4. Mock response in `ansoniaService.ts` for development

### Production Deployment

1. Add real Ansonia API credentials to Vercel
2. Monitor error logs for API failures
3. Set up alerts for review flag escalations
4. Audit vetting_events table weekly

## Troubleshooting

### "Missing Ansonia API credentials"
- Check `.env.local` has `ANSONIA_API_KEY` and `ANSONIA_ACCOUNT_ID`
- Verify Vercel environment variables for production

### Credit check timing out
- Ansonia API has 8-second timeout
- Check network connectivity to `api.ansoniadata.com`
- Consider retrying with exponential backoff

### Dashboard not updating
- Verify Supabase Realtime is enabled
- Check browser console for subscription errors
- Ensure user is authenticated

### Low trust_score blocking valid carriers
- Check Ansonia score calculation (factors: payment history, credit utilization, etc.)
- Manual review flag allows admins to override
- Contact Ansonia support if score seems inaccurate

## Future Enhancements

- [ ] Re-check credit score quarterly
- [ ] Webhook from Ansonia for score updates
- [ ] Admin dashboard for review queue
- [ ] API to manually adjust trust scores
- [ ] Integration with FMCSA safety rating
- [ ] Blend Ansonia score with internal performance metrics

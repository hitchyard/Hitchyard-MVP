# Ansonia (Equifax) Credit API Integration - Implementation Summary

## ✅ Completed Implementation

### 1. **Database Migration**
- **File**: `supabase_migrations/add_ansonia_vetting_fields.sql`
- **Added fields to `user_profiles` table**:
  - `ein` (TEXT) - Employer Identification Number
  - `dot_number` (TEXT) - DOT number
  - `ansonia_credit_score` (INTEGER) - Credit score 0-100
  - `ansonia_dtp_days` (INTEGER) - Days to Pay average
  - `ansonia_last_checked` (TIMESTAMP) - Last API check timestamp
  - `vetting_review_flag` (TEXT) - Review status ('GRIT_CLUB_MANUAL_REVIEW', 'MANUAL_REVIEW_BORDERLINE', null)
  - `vetting_review_reason` (TEXT) - Human-readable reason for flag
- **Indexes created** for faster lookups on review flags and trust scores

### 2. **Ansonia Service Library**
- **File**: `app/lib/ansoniaService.ts`
- **Exports**:
  - `fetchAnsoniaCreditData(ein, dotNumber)` - Fetches credit score and DTP from Ansonia API
  - `determineVettingStatus(creditScore)` - Maps credit score to vetting status and review flags
- **Logic**:
  - Credit score > 87 → `vetting_status='ACTIVE'` (auto-approved)
  - Credit score 70-87 → `vetting_status='PENDING'` with `review_flag='MANUAL_REVIEW_BORDERLINE'`
  - Credit score < 70 → `vetting_status='PENDING'` with `review_flag='GRIT_CLUB_MANUAL_REVIEW'` (requires manual review)
- **Fallback**: Returns conservative defaults if Ansonia API unavailable

### 3. **Ansonia Credit Check Endpoint**
- **File**: `app/api/vetting/ansonia-credit-check/route.ts`
- **Endpoint**: `POST /api/vetting/ansonia-credit-check`
- **Flow**:
  1. Receive `user_id`, `ein`, `dot_number`
  2. Call `fetchAnsoniaCreditData()` to get credit score and DTP
  3. Call `determineVettingStatus()` to map to trust status
  4. Update `user_profiles` with results (`ansonia_credit_score`, `ansonia_dtp_days`, `trust_score`, `vetting_status`, review flags)
  5. Return JSON response with vetting results
- **Called asynchronously** (fire-and-forget) after registration completes
- **Non-blocking**: Registration succeeds even if credit check fails

### 4. **Updated Registration Flow**
- **File**: `app/api/auth/register/route.ts`
- **Changes**:
  - Added `ein` and `dotNumber` to destructured request body
  - Store `ein` and `dotNumber` in `user_profiles` during registration
  - Call `POST /api/vetting/ansonia-credit-check` after registration (fire-and-forget)
  - Returns immediately with 201 while credit check happens async
- **User starts with**: `vetting_status='PENDING'`, `trust_score=0`
- **Credit check updates**: These fields in real-time

### 5. **Registration Form Updates**
- **File**: `app/register/page.tsx`
- **New fields**:
  - **EIN** (required) - Used to fetch Ansonia credit data
  - **DOT Number** (optional) - Secondary identifier
- **Form now collects**:
  - Email, Password, Company Name, Zip Code, **EIN**, **DOT**, Cargo Policy, Auto Policy
- **Sends to register endpoint** with `ein` and `dotNumber`

### 6. **Real-Time Dashboard Sync**
- **File**: `app/carrier-dashboard/CarrierDashboardClient.tsx`
- **New features**:
  - **Supabase Realtime subscription** to `user_profiles` changes
  - **State updates** when `vetting_status`, `trust_score`, or Ansonia fields change
  - **Ansonia Credit Display**:
    - Shows credit score (0-100)
    - Shows Days to Pay (DTP)
    - Status badge: "EXCELLENT" (>87), "ACCEPTABLE" (70-87), "REVIEW REQUIRED" (<70)
  - **PENDING Overlay**: Blurs and locks Available Lanes if `vettingStatus === 'PENDING'`
  - **Trust Score Guard**: BidModal rejects bids if `trustScore <= 70`

### 7. **Environment Configuration**
- **Files updated**:
  - `.env.local` - Added Ansonia credentials template
  - `.env.example` - Added Ansonia section to example config
- **Required env variables**:
  ```env
  ANSONIA_API_URL=https://api.ansoniadata.com/v1
  ANSONIA_API_KEY=your-api-key
  ANSONIA_ACCOUNT_ID=your-account-id
  ```

### 8. **Documentation**
- **File**: `ANSONIA_INTEGRATION_GUIDE.md`
- **Includes**:
  - Setup instructions (getting API credentials from Ansonia)
  - Environment variable configuration
  - Database migration steps
  - Complete API flow documentation
  - Real-time sync explanation
  - Fallback behavior
  - Audit and compliance procedures
  - Testing guide
  - Troubleshooting

## 🔄 User Journey

### Step 1: Carrier Registers
```
User submits: Email, Password, Company Name, Zip, EIN, DOT, Policies
↓
POST /api/auth/register
↓
✓ Supabase user created
✓ user_profiles inserted with vetting_status='PENDING', trust_score=0
✓ carrier_performance seeded
✓ vetting_requests logged
✓ Airtable synced
✓ **Ansonia credit check triggered (async)**
↓
Returns: "User successfully registered" (201)
```

### Step 2: Ansonia Check Runs (async, fire-and-forget)
```
POST /api/vetting/ansonia-credit-check
↓
Fetch credit score and DTP from Ansonia API
↓
Determine status:
  - score > 87 → ACTIVE
  - 70-87 → PENDING (MANUAL_REVIEW_BORDERLINE)
  - < 70 → PENDING (GRIT_CLUB_MANUAL_REVIEW)
↓
UPDATE user_profiles with:
  - ansonia_credit_score
  - ansonia_dtp_days
  - trust_score
  - vetting_status
  - vetting_review_flag
  - vetting_review_reason
```

### Step 3: Dashboard Reacts in Real-Time
```
Dashboard subscribes via Supabase Realtime
↓
When user_profiles updates:
  - Refetch/Subscribe updates state
  - PENDING overlay appears/disappears
  - Credit score displayed
  - BidModal guards enforce trust_score > 70
↓
User sees immediate feedback
```

### Step 4: Bidding Guard
```
User attempts to bid:
↓
BidModal checks:
  - isVerified (insurance + MC number)
  - trustScore > 70
↓
If trustScore <= 70:
  Show: "LOW TRUST SCORE. ASSIGNMENT DENIED."
  Block: Bid submission
↓
If passed:
  Allow: Bid submission
  Show: "BID SUBMITTED. STAND BY FOR ASSIGNMENT."
```

## 📊 Data Architecture

### Flow: Registration → Ansonia → Dashboard → Bidding

```
┌─────────────────────────────────────────────────────────────┐
│ USER REGISTRATION (POST /api/auth/register)                 │
│ - Create Supabase user                                      │
│ - Insert user_profiles (vetting_status=PENDING)             │
│ - Store EIN, DOT number                                     │
│ - Trigger Ansonia check (async)                             │
│ - Return 201 immediately                                    │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ↓ (async, fire-and-forget)
┌─────────────────────────────────────────────────────────────┐
│ ANSONIA CREDIT CHECK (POST /api/vetting/ansonia-credit-check)│
│ - Fetch credit score & DTP from Ansonia API                 │
│ - Map score to vetting_status + review_flag                 │
│ - UPDATE user_profiles in Supabase                          │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ↓ (Supabase Realtime event)
┌─────────────────────────────────────────────────────────────┐
│ DASHBOARD UPDATES (CarrierDashboardClient)                  │
│ - Subscribe to user_profiles changes                        │
│ - Update vettingStatus, trustScore, credit score state      │
│ - Render PENDING overlay or ACTIVE status                   │
│ - Display Ansonia credit score + DTP                        │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ↓ (when user clicks "Apply to Load")
┌─────────────────────────────────────────────────────────────┐
│ BIDDING GUARD (BidModal)                                     │
│ - Check: isVerified && trustScore > 70                      │
│ - If YES: Allow bid submission                              │
│ - If NO: Show "LOW TRUST SCORE. ASSIGNMENT DENIED."         │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Trust Score Levels

| Score | Status | Behavior | Review |
|-------|--------|----------|--------|
| > 87 | ACTIVE | ✓ Can bid immediately | Auto-approved |
| 70-87 | PENDING | ⏳ Can browse, manual review | Borderline |
| < 70 | PENDING | 🚫 Cannot bid | Manual review required |

## 🛠️ Next Steps for Production

1. **Get Ansonia API Credentials**:
   - Visit https://www.ansoniadata.com/api
   - Register for developer account
   - Create API application
   - Copy API Key & Account ID

2. **Add to Vercel Environment**:
   ```bash
   vercel env add ANSONIA_API_URL
   vercel env add ANSONIA_API_KEY
   vercel env add ANSONIA_ACCOUNT_ID
   ```

3. **Run Database Migration**:
   ```bash
   supabase migration up
   # Or manually run SQL from add_ansonia_vetting_fields.sql
   ```

4. **Test Flow**:
   - Register test carrier with EIN/DOT
   - Verify Ansonia credit check triggers
   - Check dashboard for real-time updates
   - Attempt bids with different trust scores

5. **Monitor**:
   - Check logs for Ansonia errors
   - Review vetting_events table for audit trail
   - Watch for carriers flagged for manual review

## 🎯 Key Features

✅ **Automated Vetting**: No manual intervention needed for credit score > 87  
✅ **Real-Time Sync**: Dashboard updates immediately via Supabase subscriptions  
✅ **Bidding Guard**: Trust score enforces compliance at transaction level  
✅ **Manual Review Queue**: Borderline and low scores flagged for admin review  
✅ **Non-Blocking**: Registration succeeds even if Ansonia API fails  
✅ **Audit Trail**: All vetting events logged to vetting_events table  
✅ **Imperial Tone**: "ACCESS RESTRICTED. GRIT CLUB CLEARANCE REQUIRED." messaging  

## 📝 Build Status

✅ **Build successful**: All files compiled, types valid, production-ready
✅ **Next.js 14.2.35** optimized build completed
✅ **Bundle sizes** within normal ranges
✅ **Static pages** pre-rendered (21/21)

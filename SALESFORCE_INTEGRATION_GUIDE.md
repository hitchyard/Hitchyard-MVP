# Hitchyard Salesforce Migration: Integration Guide

## Overview

This guide describes how to migrate from Airtable to Salesforce as the **Single Source of Truth** for Hitchyard's freight marketplace. It covers setup, integration, testing, and deployment.

---

## Phase 1: Salesforce Setup (Week 1)

### Step 1.1: Create Salesforce Organization

1. Go to [Salesforce.com](https://www.salesforce.com)
2. Click "Sign up for free" → Create Developer Edition org
3. Fill in company details, confirm email
4. Login and complete setup wizard

### Step 1.2: Create Custom Objects

In Salesforce Setup → Object Manager → Create:

#### Create Carrier__c
```
Label: Carrier
Plural Label: Carriers
API Name: Carrier__c
Object Category: Custom
Description: Represents freight carriers with vetting status and trust scores
```

#### Create Load__c
```
Label: Load
Plural Label: Loads
API Name: Load__c
Object Category: Custom
Description: Represents freight loads with routing and status tracking
```

#### Create Agent_Workflow__c (Optional, for audit)
```
Label: Agent Workflow
Plural Label: Agent Workflows
API Name: Agent_Workflow__c
Object Category: Custom
Description: Tracks Dify agent execution logs
```

### Step 1.3: Add Custom Fields to Carrier__c

Use Setup → Object Manager → Carrier__c → Fields:

| Field Name | Type | API Name | Required | Length |
|------------|------|----------|----------|--------|
| Supabase ID | Text | Supabase_ID__c | Yes | 255 |
| DOT Number | Text | DOT_Number__c | No | 20 |
| EIN | Text | EIN__c | No | 20 |
| Safety Status | Picklist | Safety_Status__c | Yes | (Values: Active, Pending, Manual Review) |
| Trust Score | Number | Trust_Score__c | Yes | 3,0 |
| Insurance Expiration | Date | Insurance_Expiration__c | No | - |
| Performance On-Time Rate | Percent | Performance_OnTime_Rate__c | No | - |
| Last Vetting Check | Date/Time | Last_Vetting_Check__c | No | - |
| Ansonia Credit Score | Number | Ansonia_Credit_Score__c | No | 3,0 |
| Ansonia DTP Days | Number | Ansonia_DTP_Days__c | No | 3,0 |

**Create Lookup Field** (for Load → Carrier relationship):
- Go to Load__c → Fields → New Lookup
- Lookup To: Carrier__c
- Label: Carrier
- API Name: Carrier_ID__c

### Step 1.4: Add Custom Fields to Load__c

| Field Name | Type | API Name | Required | Length |
|------------|------|----------|----------|--------|
| Load Number | Text | Load_Number__c | Yes | 50 |
| Shipper ID | Text | Shipper_ID__c | Yes | 255 |
| Carrier ID | Lookup | Carrier_ID__c | No | (Links to Carrier__c) |
| Live Status | Picklist | Live_Status__c | Yes | (Values: Pending, In-Transit, Delayed, Delivered) |
| Origin City | Text | Origin_City__c | Yes | 100 |
| Origin State | Text | Origin_State__c | Yes | 2 |
| Destination City | Text | Destination_City__c | Yes | 100 |
| Destination State | Text | Destination_State__c | Yes | 2 |
| Lane Data | Long Text Area | Lane_Data__c | No | - |
| Market Rate Suggested | Currency | Market_Rate_Suggested__c | No | 16,2 |
| Bid Rate Accepted | Currency | Bid_Rate_Accepted__c | No | 16,2 |
| Last GPS Update | Date/Time | Last_GPS_Update__c | No | - |
| Estimated Delivery | Date/Time | Estimated_Delivery__c | No | - |
| Actual Delivery | Date/Time | Actual_Delivery__c | No | - |

### Step 1.5: Create Indexes (for Performance)

Setup → Object Manager → Carrier__c → Indexes:
- Create on `Safety_Status__c` (for quick filtering of active carriers)
- Create on `Trust_Score__c` (for ranking queries)
- Create on `Supabase_ID__c` (for lookups by user_id)

Do same for Load__c:
- Index on `Live_Status__c`
- Index on `Carrier_ID__c`

---

## Phase 2: Integration User & API Setup (Week 1-2)

### Step 2.1: Create Integration User

1. Setup → Users → New User
2. Fill in:
   - First Name: `Integration`
   - Last Name: `User`
   - Email: `integration-user@hitchyard.sandbox.my.salesforce.com` (or production)
   - User License: `Salesforce`
   - Profile: `System Administrator` (or custom API-only profile)
3. Save → Note the username

### Step 2.2: Generate Security Token

1. Click the user avatar → Settings
2. Search for "Reset My Security Token"
3. Click "Reset Security Token"
4. Email sent with token (expires after 24 hours if not used)

### Step 2.3: Create Connected App

1. Setup → Apps → App Manager → New Connected App
2. Fill in:
   - Connected App Name: `Hitchyard API Client`
   - API Name: `Hitchyard_API_Client`
   - Contact Email: your@email.com
3. Enable OAuth Settings:
   - Callback URL: `http://localhost:3000/api/auth/salesforce/callback` (for development)
   - Select Scopes:
     - `api` (allows full API access)
     - `refresh_token, offline_access` (for token refresh)
4. Save → Note Client ID and Client Secret

### Step 2.4: Authorize Connected App

1. Find your Connected App in App Manager
2. Click → Manage
3. Click "Edit Policies"
4. IP Relaxation: `Relaxed IP restrictions` (for development)
5. Save
6. Refresh token manually from CLI or via OAuth flow

---

## Phase 3: Environment Configuration (Week 2)

### Step 3.1: Update .env.local

Create/update `.env.local` in project root:

```env
# Salesforce
SALESFORCE_INSTANCE_URL=https://your-instance.salesforce.com
SALESFORCE_CLIENT_ID=your-connected-app-client-id
SALESFORCE_CLIENT_SECRET=your-connected-app-secret
SALESFORCE_USERNAME=integration-user@hitchyard.sandbox.my.salesforce.com
SALESFORCE_PASSWORD=your-password
SALESFORCE_SECURITY_TOKEN=your-security-token-from-email
SALESFORCE_ACCESS_TOKEN=your-access-token-or-refresh-token

# Dify (if using Dify agents)
DIFY_API_KEY=your-dify-api-key
DIFY_BASE_URL=https://your-dify-instance.com/api

# Keep existing configs
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
STRIPE_SECRET_KEY=...
```

### Step 3.2: Verify Connection

Run:
```bash
npm install jsforce
npm run dev
```

Test connection by calling endpoint:
```bash
curl -X POST http://localhost:3000/api/sync-salesforce \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user-123",
    "email": "test@example.com",
    "company_name": "Test Carrier LLC",
    "ein": "12-3456789",
    "dot_number": "1234567"
  }'
```

Expected response:
```json
{
  "message": "Salesforce sync successful.",
  "carrier_id": "a01xx000000001AAA",
  "status": "pending_screening"
}
```

---

## Phase 4: Data Migration (Week 3)

### Step 4.1: Export Airtable Data

1. Go to Airtable → "Carrier Vetting Queue" base
2. Select all records
3. Export to CSV

### Step 4.2: Transform & Load to Salesforce

Create migration script:

```bash
# scripts/migrate-airtable-to-salesforce.js
const Airtable = require('airtable');
const jsforce = require('jsforce');
const fs = require('fs');

const airtableBase = new Airtable({ apiKey: process.env.AIRTABLE_PAT }).base(process.env.AIRTABLE_BASE_ID);
const sfConnection = new jsforce.Connection({
  instanceUrl: process.env.SALESFORCE_INSTANCE_URL,
  accessToken: process.env.SALESFORCE_ACCESS_TOKEN,
});

async function migrateData() {
  const records = await airtableBase('Carrier Vetting Queue').select().all();
  
  for (const record of records) {
    const carrierRecord = {
      Name: record.fields['Company Name'],
      Supabase_ID__c: record.fields['Supabase ID'],
      DOT_Number__c: record.fields['DOT Number'],
      EIN__c: record.fields['EIN'],
      Safety_Status__c: 'Pending',
      Trust_Score__c: 0,
    };
    
    const result = await sfConnection.sobject('Carrier__c').create(carrierRecord);
    console.log(`Migrated: ${result.id}`);
  }
}

migrateData().catch(console.error);
```

Run:
```bash
node scripts/migrate-airtable-to-salesforce.js
```

### Step 4.3: Verify Migration

In Salesforce → Carrier object → List View, confirm all records appeared.

---

## Phase 5: Testing (Week 4)

### Step 5.1: Unit Tests for Salesforce Client

Create `__tests__/salesforceClient.test.ts`:

```typescript
import {
  queryCarrierByDOT,
  createCarrier,
  findActiveCarriers,
  updateCarrierVettingStatus,
} from '@/lib/salesforceClient';

describe('Salesforce Client', () => {
  it('should create a carrier record', async () => {
    const result = await createCarrier({
      name: 'Test Carrier Inc',
      supabaseId: 'test-123',
      dotNumber: '1234567',
      ein: '12-3456789',
    });
    expect(result.id).toBeDefined();
  });

  it('should query carrier by DOT', async () => {
    const carrier = await queryCarrierByDOT('1234567');
    expect(carrier).toBeDefined();
    expect(carrier.DOT_Number__c).toBe('1234567');
  });

  it('should find active carriers', async () => {
    const carriers = await findActiveCarriers(10);
    expect(carriers.length).toBeGreaterThan(0);
    expect(carriers[0].Safety_Status__c).toBe('Active');
  });

  it('should update carrier vetting status', async () => {
    const result = await updateCarrierVettingStatus('a01xx000000001AAA', {
      trustScore: 85,
      safetyStatus: 'Active',
    });
    expect(result.success).toBe(true);
  });
});
```

Run:
```bash
npm test -- salesforceClient.test.ts
```

### Step 5.2: Integration Tests for Endpoints

Create `__tests__/api/sync-salesforce.test.ts`:

```typescript
import { POST } from '@/app/api/sync-salesforce/route';
import { NextRequest } from 'next/server';

describe('POST /api/sync-salesforce', () => {
  it('should create carrier and return 200', async () => {
    const request = new NextRequest('http://localhost:3000/api/sync-salesforce', {
      method: 'POST',
      body: JSON.stringify({
        user_id: 'test-user-123',
        email: 'test@example.com',
        company_name: 'Test Carrier',
        ein: '12-3456789',
        dot_number: '1234567',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.carrier_id).toBeDefined();
  });

  it('should return 400 if missing required fields', async () => {
    const request = new NextRequest('http://localhost:3000/api/sync-salesforce', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        // missing user_id, company_name
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
```

### Step 5.3: End-to-End Test (Manual)

1. Register a new carrier via the app
2. Check Salesforce → Carrier object → verify new record created
3. Check Supabase user_profiles → verify same user exists
4. Verify vetting workflow triggered (Agent_Workflow__c record created)

---

## Phase 6: Dify Agent Setup (Week 4)

### Step 6.1: Install Dify Marketplace Plugin

1. Login to Dify → Admin Dashboard
2. Navigate to Marketplace → Search "Salesforce"
3. Click Install
4. Configure credentials:
   ```
   Client ID: {{SALESFORCE_CLIENT_ID}}
   Client Secret: {{SALESFORCE_CLIENT_SECRET}}
   Instance URL: {{SALESFORCE_INSTANCE_URL}}
   ```

### Step 6.2: Create Agent YAMLs in Dify

Reference: See `DIFY_AGENT_CONFIGURATION.md` for complete YAML definitions.

Create agents in Dify UI:
1. **Screening Agent** - Verify carrier compliance
2. **Matchmaking Agent** - Rank and assign carriers to loads
3. **Tracking Agent** - Monitor load status
4. **Forecasting Agent** - Predict market rates
5. **Exception Agent** - Handle delays and recovery
6. **Onboarding Agent** - Vetting and doc collection

### Step 6.3: Test Agent Workflows

1. Submit a new carrier registration
2. Verify Screening Agent executed (check logs)
3. Create a new load
4. Verify Matchmaking Agent ranked carriers
5. Update load status to "In-Transit"
6. Verify Tracking Agent updated Salesforce record

---

## Phase 7: Cutover & Decommission (Week 5)

### Step 7.1: Update Deployment Configuration

Update Vercel environment variables:
```
SALESFORCE_INSTANCE_URL=your-production-instance
SALESFORCE_CLIENT_ID=prod-client-id
SALESFORCE_CLIENT_SECRET=prod-secret
...
```

### Step 7.2: Monitor Logs

Watch for errors:
```bash
# In Vercel dashboard or local logs
SALESFORCE_SYNC_ERROR
DIFY_AGENT_FAILURE
SOQL_QUERY_ERROR
```

### Step 7.3: Decommission Airtable

Once confirmed Salesforce sync working 100%:
1. Archive Airtable base (don't delete immediately)
2. Remove Airtable API key from environment
3. Keep `/api/sync-airtable` endpoint as fallback (but disable)

---

## Troubleshooting

### Connection Issues

**Error**: `Salesforce connection failed`
- Check SALESFORCE_INSTANCE_URL is correct (no trailing slash)
- Verify access token is not expired (refresh if needed)
- Check IP restrictions in Connected App settings

### SOQL Query Errors

**Error**: `Field does not exist` in SOQL query
- Verify field API names match exactly (case-sensitive)
- Check custom fields have been created in Salesforce
- Use Salesforce SOQL IDE to test queries

### Dify Plugin Issues

**Error**: `Plugin authentication failed`
- Verify credentials in Dify plugin config
- Check Connected App is authorized
- Test credentials manually: `sf login`

### Data Migration Issues

**Error**: `Bulk insert failed`
- Check for duplicate Supabase IDs
- Verify all required fields populated
- Use batch inserts with error handling

---

## Performance Optimization

### Caching

Implement caching for frequently accessed carriers:

```typescript
import { cache } from 'react';

export const getCachedCarrier = cache(async (carrierId: string) => {
  return queryCarrierByDOT(carrierId);
});
```

### Query Optimization

Use selective field queries:
```soql
-- GOOD: Only fetch needed fields
SELECT Id, Trust_Score__c FROM Carrier__c WHERE Safety_Status__c = 'Active'

-- AVOID: Fetch all fields
SELECT * FROM Carrier__c
```

### Rate Limiting

Salesforce API limits: 15,000 API calls / 24 hours (Developer Edition)

Implement queue:
```typescript
import Bull from 'bull';

const salesforceQueue = new Bull('salesforce', process.env.REDIS_URL);

salesforceQueue.add(
  { operation: 'createCarrier', data: carrierData },
  { delay: 1000 } // 1 second between requests
);
```

---

## Monitoring & Alerts

### Salesforce Setup → Monitoring

1. Enable Audit Trail → Setup → Audit Trail
2. Monitor custom object changes
3. Review Agent_Workflow__c for execution logs

### Application Monitoring

Log sync failures:
```typescript
import { logError } from '@/lib/logger';

try {
  await createCarrier(data);
} catch (error) {
  await logError({
    context: 'Salesforce Sync',
    error,
    user_id: userId,
  });
}
```

---

## Success Metrics

- [ ] All carriers migrated from Airtable to Salesforce
- [ ] Zero downtime during cutover
- [ ] All Dify agents executing successfully
- [ ] Load times < 200ms for Salesforce queries
- [ ] 99.9% API availability
- [ ] All edge cases (delays, reassignments) handled automatically


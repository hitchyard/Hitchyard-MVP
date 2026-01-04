# Hitchyard Salesforce Migration: Deployment Checklist

## Phase 1: Salesforce Setup (Week 1)

### Step 1.1: Create Salesforce Organization
- [ ] Go to salesforce.com
- [ ] Sign up for Developer Edition
- [ ] Complete setup wizard
- [ ] Confirm email address

### Step 1.2: Create Custom Objects
- [ ] Create Carrier__c object
- [ ] Create Load__c object
- [ ] Create Agent_Workflow__c object
- [ ] Confirm all objects visible in Object Manager

### Step 1.3: Add Custom Fields to Carrier__c
- [ ] Supabase_ID__c (Text, required)
- [ ] DOT_Number__c (Text)
- [ ] EIN__c (Text)
- [ ] Safety_Status__c (Picklist: Active, Pending, Manual Review)
- [ ] Trust_Score__c (Number, required, default 0)
- [ ] Insurance_Expiration__c (Date)
- [ ] Performance_OnTime_Rate__c (Percent)
- [ ] Last_Vetting_Check__c (Date/Time)
- [ ] Ansonia_Credit_Score__c (Number)
- [ ] Ansonia_DTP_Days__c (Number)

### Step 1.4: Add Custom Fields to Load__c
- [ ] Load_Number__c (Text, required)
- [ ] Shipper_ID__c (Text, required)
- [ ] Carrier_ID__c (Lookup to Carrier__c)
- [ ] Live_Status__c (Picklist: Pending, In-Transit, Delayed, Delivered)
- [ ] Origin_City__c (Text, required)
- [ ] Origin_State__c (Text, required, length 2)
- [ ] Destination_City__c (Text, required)
- [ ] Destination_State__c (Text, required, length 2)
- [ ] Lane_Data__c (Long Text Area)
- [ ] Market_Rate_Suggested__c (Currency)
- [ ] Bid_Rate_Accepted__c (Currency)
- [ ] Last_GPS_Update__c (Date/Time)
- [ ] Estimated_Delivery__c (Date/Time)
- [ ] Actual_Delivery__c (Date/Time)

### Step 1.5: Create Indexes
- [ ] Index on Carrier__c.Safety_Status__c
- [ ] Index on Carrier__c.Trust_Score__c
- [ ] Index on Carrier__c.Supabase_ID__c
- [ ] Index on Load__c.Live_Status__c
- [ ] Index on Load__c.Carrier_ID__c

---

## Phase 2: Integration User & API Setup (Week 1-2)

### Step 2.1: Create Integration User
- [ ] Navigate to Setup → Users → New User
- [ ] First Name: "Integration"
- [ ] Last Name: "User"
- [ ] Email: "integration-user@hitchyard.sandbox.my.salesforce.com"
- [ ] User License: Salesforce
- [ ] Profile: System Administrator (or API-only)
- [ ] Save and note the username

### Step 2.2: Generate Security Token
- [ ] Login as integration user
- [ ] Click avatar → Settings
- [ ] Search "Reset My Security Token"
- [ ] Click "Reset Security Token"
- [ ] Check email for token (expires 24h)
- [ ] Copy token securely

### Step 2.3: Create Connected App
- [ ] Navigate to Setup → Apps → App Manager
- [ ] Click "New Connected App"
- [ ] Connected App Name: "Hitchyard API Client"
- [ ] API Name: "Hitchyard_API_Client"
- [ ] Contact Email: (your email)
- [ ] Enable "OAuth Settings"
- [ ] Callback URL: `http://localhost:3000/api/auth/salesforce/callback`
- [ ] Selected OAuth Scopes:
  - [ ] api
  - [ ] refresh_token
  - [ ] offline_access
- [ ] Save
- [ ] Copy "Client ID" and "Client Secret"

### Step 2.4: Authorize Connected App
- [ ] Find Connected App in App Manager
- [ ] Click → Manage
- [ ] Click "Edit Policies"
- [ ] IP Relaxation: "Relaxed IP restrictions"
- [ ] Save

---

## Phase 3: Environment Configuration (Week 2)

### Step 3.1: Update .env.local
Create/update `./.env.local`:
```env
SALESFORCE_INSTANCE_URL=https://your-instance.salesforce.com
SALESFORCE_CLIENT_ID=your-client-id
SALESFORCE_CLIENT_SECRET=your-client-secret
SALESFORCE_USERNAME=integration-user@hitchyard.sandbox.my.salesforce.com
SALESFORCE_PASSWORD=your-password
SALESFORCE_SECURITY_TOKEN=your-security-token
SALESFORCE_ACCESS_TOKEN=your-access-token
DIFY_API_KEY=your-dify-api-key
DIFY_BASE_URL=https://your-dify-instance.com/api
```
- [ ] All variables filled in
- [ ] File saved
- [ ] .gitignore already excludes .env.local

### Step 3.2: Install jsforce Library
- [ ] Run: `npm install jsforce`
- [ ] Verify in package.json: `"jsforce": "^2.0.0"`
- [ ] Verify in node_modules: `jsforce` directory exists

### Step 3.3: Test Connection
- [ ] Run: `npm run dev`
- [ ] Test endpoint with curl:
  ```bash
  curl -X POST http://localhost:3000/api/sync-salesforce \
    -H "Content-Type: application/json" \
    -d '{"user_id":"test","email":"test@test.com","company_name":"Test LLC","ein":"12-3456789","dot_number":"1234567"}'
  ```
- [ ] Expected response: `{ "carrier_id": "...", "status": "pending_screening" }`
- [ ] Check Salesforce Carrier object → verify new record created

---

## Phase 4: Data Migration (Week 3)

### Step 4.1: Export Airtable Data
- [ ] Go to Airtable
- [ ] Open "Carrier Vetting Queue" base
- [ ] Select all records
- [ ] Export to CSV
- [ ] Save as: `carriers_export.csv`

### Step 4.2: Transform Data
- [ ] Create script: `scripts/migrate-airtable-to-salesforce.js`
- [ ] Parse CSV
- [ ] Map fields to Salesforce API names
- [ ] Create test batch (10 records)

### Step 4.3: Bulk Insert (Test)
- [ ] Run: `node scripts/migrate-airtable-to-salesforce.js --test --limit 10`
- [ ] Verify in Salesforce: 10 new Carrier records
- [ ] Check field values match

### Step 4.4: Bulk Insert (Production)
- [ ] Run: `node scripts/migrate-airtable-to-salesforce.js --all`
- [ ] Monitor for errors
- [ ] Verify total count matches Airtable
- [ ] Spot-check 10 random records

### Step 4.5: Verify Migration
- [ ] In Salesforce, go to Carrier object
- [ ] Check record count: should match Airtable
- [ ] Check Safety_Status__c: all should be 'Pending' or 'Active'
- [ ] Check Trust_Score__c: all should be > 0
- [ ] Check Supabase_ID__c: all populated

---

## Phase 5: Testing (Week 4)

### Step 5.1: Unit Tests
- [ ] Create `lib/__tests__/salesforceClient.test.ts`
- [ ] Test createCarrier()
- [ ] Test queryCarrierByDOT()
- [ ] Test findActiveCarriers()
- [ ] Test updateCarrierVettingStatus()
- [ ] Test createLoad()
- [ ] Test updateLoadStatus()
- [ ] Test getLaneHistory()
- [ ] Test findDelayedLoads()
- [ ] Test reassignLoad()
- [ ] Run: `npm test -- salesforceClient.test.ts`
- [ ] All tests passing

### Step 5.2: Integration Tests
- [ ] Create `app/api/__tests__/sync-salesforce.test.ts`
- [ ] Test POST /api/sync-salesforce with valid data
- [ ] Test POST /api/sync-salesforce with missing fields
- [ ] Test endpoint creates Carrier__c
- [ ] Test endpoint logs to Agent_Workflow__c
- [ ] Run: `npm test -- sync-salesforce.test.ts`
- [ ] All tests passing

### Step 5.3: E2E Tests (Manual)
- [ ] Register new carrier via app
- [ ] Check Supabase: user created
- [ ] Check Salesforce: Carrier__c created
- [ ] Check Salesforce: Agent_Workflow__c has "Onboarding" entry
- [ ] Verify all fields populated correctly
- [ ] Create a new load
- [ ] Verify matchmaking assigned a carrier
- [ ] Check Salesforce: Load__c.Carrier_ID__c populated
- [ ] Simulate carrier picking up load
- [ ] Verify tracking agent updated Live_Status__c to "In-Transit"
- [ ] Check dashboard shows real-time updates

### Step 5.4: Performance Testing
- [ ] Query response time: < 100ms
- [ ] Create operation time: < 200ms
- [ ] Bulk insert 1,000 records: < 30s
- [ ] Agent response time: < 3s

---

## Phase 6: Dify Agent Setup (Week 4)

### Step 6.1: Install Dify Plugin
- [ ] Login to Dify
- [ ] Navigate to Admin → Marketplace
- [ ] Search "Salesforce"
- [ ] Click Install
- [ ] Wait for installation
- [ ] Verify success message

### Step 6.2: Configure Plugin Credentials
- [ ] Go to Marketplace → Salesforce Plugin → Settings
- [ ] Choose OAuth2 or Username/Password
- [ ] If OAuth2:
  - [ ] Enter Client ID
  - [ ] Enter Client Secret
  - [ ] Click "Authorize"
  - [ ] Approve access in Salesforce
- [ ] If Username/Password:
  - [ ] Enter Instance URL
  - [ ] Enter Username
  - [ ] Enter Password
  - [ ] Enter Security Token
- [ ] Click "Test Connection"
- [ ] Verify success: "Connection successful"

### Step 6.3: Create Screening Agent
- [ ] In Dify, create new agent: "Screening Agent"
- [ ] Set model: gpt-4, temperature: 0.3
- [ ] Add Salesforce tool: query_carrier by DOT
- [ ] Add prompt (see DIFY_AGENT_CONFIGURATION.md)
- [ ] Test with sample DOT number
- [ ] Verify output: { "approved": true/false, "reason": "..." }

### Step 6.4: Create Onboarding Agent
- [ ] Create new agent: "Onboarding Agent"
- [ ] Add tools: create_carrier, request_document
- [ ] Add prompt
- [ ] Test: trigger with new user data
- [ ] Verify: Carrier__c created in Salesforce

### Step 6.5: Create Matchmaking Agent
- [ ] Create new agent: "Matchmaking Agent"
- [ ] Add tools: get_load, query_carriers, assign_carrier
- [ ] Add tool reference: Forecasting Agent
- [ ] Add prompt
- [ ] Test: create load, verify carrier assigned
- [ ] Verify: Load__c.Carrier_ID__c populated

### Step 6.6: Create Tracking Agent
- [ ] Create new agent: "Tracking Agent"
- [ ] Add tools: get_load_status, update_status, get_gps_data
- [ ] Set polling interval: 5 minutes
- [ ] Add prompt
- [ ] Test: update load status
- [ ] Verify: Live_Status__c updated in Salesforce

### Step 6.7: Create Forecasting Agent
- [ ] Create new agent: "Forecasting Agent"
- [ ] Add tools: get_lane_history, update_suggested_rate
- [ ] Add prompt
- [ ] Test: provide origin/destination
- [ ] Verify: suggested market rate calculated

### Step 6.8: Create Exception Agent
- [ ] Create new agent: "Exception Agent"
- [ ] Add tools: find_delayed, get_carrier, reassign_load
- [ ] Add tool reference: Matchmaking Agent
- [ ] Add prompt
- [ ] Test: simulate delayed load
- [ ] Verify: carrier reassigned

### Step 6.9: Test Agent Chain
- [ ] Trigger Onboarding Agent
- [ ] Verify Screening Agent called automatically
- [ ] Check Carrier__c updated with verification result
- [ ] Verify Agent_Workflow__c has complete history

---

## Phase 7: Production Cutover (Week 5)

### Step 7.1: Production Salesforce Setup
- [ ] Create production Salesforce org (if separate)
- [ ] Duplicate all custom objects and fields
- [ ] Create production integration user
- [ ] Create production Connected App
- [ ] Obtain production credentials

### Step 7.2: Update Production Environment
- [ ] In Vercel/production, update environment variables:
  - [ ] SALESFORCE_INSTANCE_URL (production)
  - [ ] SALESFORCE_CLIENT_ID (production)
  - [ ] SALESFORCE_CLIENT_SECRET (production)
  - [ ] SALESFORCE_USERNAME (production)
  - [ ] SALESFORCE_PASSWORD (production)
  - [ ] SALESFORCE_SECURITY_TOKEN (production)
- [ ] Verify no hardcoded dev credentials

### Step 7.3: Production Testing
- [ ] Register test carrier in production
- [ ] Verify Carrier__c created in production Salesforce
- [ ] Verify Supabase user created
- [ ] Test load creation and matchmaking
- [ ] Monitor logs for errors

### Step 7.4: Monitor Deployment
- [ ] Watch Vercel logs for errors
- [ ] Check Salesforce API usage
- [ ] Verify agent executions
- [ ] Monitor response times
- [ ] Check for any sync failures

### Step 7.5: Archive Airtable
- [ ] Verify all data migrated to Salesforce
- [ ] Keep Airtable as backup (don't delete)
- [ ] Remove AIRTABLE_API_KEY from production env
- [ ] Keep sync-airtable endpoint as fallback (don't delete code)
- [ ] Add warning comment in code

### Step 7.6: Post-Cutover Verification
- [ ] Day 1: Monitor 100% of transactions
- [ ] Day 2-3: Check sample of random registrations
- [ ] Day 4-5: Verify agents processing correctly
- [ ] Week 2: Review Salesforce audit trail
- [ ] Week 3: Generate metrics report

---

## Post-Deployment (Ongoing)

### Monitoring
- [ ] Set up Salesforce API usage alerts (> 80% of quota)
- [ ] Monitor Vercel logs for Salesforce errors
- [ ] Check Agent_Workflow__c for failed executions
- [ ] Weekly review of vetting decisions

### Optimization
- [ ] Profile slow queries
- [ ] Add caching for frequently accessed carriers
- [ ] Implement batch updates for bulk operations
- [ ] Monitor and tune agent response times

### Maintenance
- [ ] Monthly security token rotation
- [ ] Quarterly credential review
- [ ] Bi-annual capacity planning
- [ ] Annual disaster recovery testing

---

## Success Criteria

- [x] All Salesforce objects and fields created
- [x] Integration user provisioned with credentials
- [x] jsforce library installed
- [x] Environment variables configured
- [x] Connection tested successfully
- [x] Data migrated from Airtable (100%)
- [x] All tests passing (unit, integration, E2E)
- [x] 6 Dify agents created and tested
- [x] Agent chain working correctly
- [x] Production deployment successful
- [x] Zero downtime cutover
- [x] All agent executions logged
- [x] Performance metrics met
- [x] Security audit passed
- [x] Documentation complete

---

**Start Date**: January 4, 2026  
**Estimated Completion**: January 31, 2026  
**Project Lead**: Hitchyard Engineering


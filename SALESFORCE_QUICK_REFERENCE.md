# Hitchyard Salesforce Migration: Quick Reference

## 📋 Documents Created

| Document | Purpose | Key Content |
|----------|---------|-------------|
| [SALESFORCE_SCHEMA.md](SALESFORCE_SCHEMA.md) | Data model definition | Carrier__c, Load__c, Agent_Workflow__c field definitions + SOQL queries |
| [DIFY_AGENT_CONFIGURATION.md](DIFY_AGENT_CONFIGURATION.md) | Agent logic specifications | 6-agent workflows with YAML configs and prompt templates |
| [SALESFORCE_INTEGRATION_GUIDE.md](SALESFORCE_INTEGRATION_GUIDE.md) | Step-by-step deployment | 7-phase rollout plan, testing, troubleshooting |
| [DIFY_SALESFORCE_PLUGIN_CONFIG.md](DIFY_SALESFORCE_PLUGIN_CONFIG.md) | Plugin setup instructions | Installation, credential config, agent tool definitions |
| [HITCHYARD_SALESFORCE_IMPLEMENTATION.md](HITCHYARD_SALESFORCE_IMPLEMENTATION.md) | Executive summary | Overview, deliverables, timeline, checklist |

## 🏗️ Code Changes

| File | Change | Status |
|------|--------|--------|
| `lib/salesforceClient.ts` | New jsforce wrapper | ✅ Created |
| `app/api/sync-salesforce/route.ts` | New Salesforce sync endpoint | ✅ Created |
| `app/api/auth/register/route.ts` | Updated to call sync-salesforce | ✅ Updated |
| `package.json` | Added jsforce dependency | ✅ Updated |
| `.env.example` | Added Salesforce env vars | ✅ Updated |

## 🔧 Quick Setup (5 Minutes)

### 1. Install Dependencies
```bash
npm install jsforce
```

### 2. Set Environment Variables
```env
SALESFORCE_INSTANCE_URL=https://your-instance.salesforce.com
SALESFORCE_CLIENT_ID=your-client-id
SALESFORCE_CLIENT_SECRET=your-client-secret
SALESFORCE_USERNAME=integration-user@hitchyard.com
SALESFORCE_PASSWORD=your-password
SALESFORCE_SECURITY_TOKEN=your-token
SALESFORCE_ACCESS_TOKEN=your-access-token
```

### 3. Test Connection
```bash
curl -X POST http://localhost:3000/api/sync-salesforce \
  -H "Content-Type: application/json" \
  -d '{"user_id":"test","email":"test@test.com","company_name":"Test Inc","ein":"12-3456789","dot_number":"1234567"}'
```

## 🎯 6-Agent Workflow Summary

```
New Carrier Registration
         ↓
  Onboarding Agent
  ├─ Create Carrier__c
  ├─ Request docs
  └─ Trigger Screening
         ↓
  Screening Agent
  ├─ Verify DOT/Insurance
  └─ Set Safety_Status__c
         ↓
  Dashboard Shows Vetting Status
         ↓
  Shipper Posts Load
         ↓
  Matchmaking Agent
  ├─ Query active carriers
  ├─ Rank by trust score
  ├─ Call Forecasting Agent → Get market rate
  └─ Assign carrier to Load__c
         ↓
  Carrier Accepts Bid
         ↓
  Tracking Agent (every 5 min)
  ├─ Poll GPS updates
  ├─ Update Live_Status__c
  └─ Calculate ETA
         ↓
  Load In-Transit
         ↓
  If Delayed:
  Exception Agent
  ├─ Check carrier trust score
  ├─ Trigger Matchmaking for backup
  └─ Reassign Load__c.Carrier_ID__c
```

## 📊 Database Schema (Quick View)

### Carrier__c
```
Fields: Id, Name, Supabase_ID__c, DOT_Number__c, EIN__c
        Safety_Status__c, Trust_Score__c, Insurance_Expiration__c
        Performance_OnTime_Rate__c, Ansonia_Credit_Score__c, Ansonia_DTP_Days__c

Indexes: Safety_Status__c, Trust_Score__c, Supabase_ID__c
```

### Load__c
```
Fields: Id, Load_Number__c, Shipper_ID__c, Carrier_ID__c
        Live_Status__c, Origin_City__c, Origin_State__c
        Destination_City__c, Destination_State__c
        Lane_Data__c, Market_Rate_Suggested__c, Bid_Rate_Accepted__c
        Last_GPS_Update__c, Estimated_Delivery__c, Actual_Delivery__c

Indexes: Live_Status__c, Carrier_ID__c
```

### Agent_Workflow__c
```
Fields: Id, Workflow_Type__c, Related_Load__c, Related_Carrier__c
        Execution_Status__c, Action_Taken__c, CreatedDate

Purpose: Audit trail for all agent executions
```

## 🔑 Key SOQL Queries

### Find Active Carriers (Screening)
```soql
SELECT Id, Safety_Status__c, Insurance_Expiration__c
FROM Carrier__c
WHERE Safety_Status__c = 'Active' AND Insurance_Expiration__c >= TODAY
```

### Rank Carriers by Trust (Matchmaking)
```soql
SELECT Id, Name, Trust_Score__c, Performance_OnTime_Rate__c
FROM Carrier__c
WHERE Safety_Status__c = 'Active'
ORDER BY Trust_Score__c DESC
LIMIT 20
```

### Get Lane History (Forecasting)
```soql
SELECT Lane_Data__c, Bid_Rate_Accepted__c, CreatedDate
FROM Load__c
WHERE Origin_State__c = 'AZ' AND Destination_State__c = 'UT'
  AND Live_Status__c = 'Delivered'
ORDER BY CreatedDate DESC
LIMIT 100
```

### Find Delayed Loads (Exception)
```soql
SELECT Id, Load_Number__c, Carrier_ID__c, Estimated_Delivery__c
FROM Load__c
WHERE Live_Status__c = 'Delayed'
  AND CreatedDate = LAST_N_DAYS:7
ORDER BY LastModifiedDate DESC
```

## 🎛️ Dify Agent Tool Template

```yaml
name: "Screening Agent"
type: "agent"
model: "gpt-4"
temperature: 0.3

tools:
  - name: "query_carrier"
    type: "salesforce_connector"
    config:
      sobject: "Carrier__c"
      fields: ["Id", "Safety_Status__c", "Insurance_Expiration__c"]
      where: "DOT_Number__c = '{{ dot_number }}'"

prompt: |
  Verify this carrier meets Hitchyard standards:
  {{ query_carrier_result }}
  
  Check: Safety_Status == 'Active' AND Insurance valid
  Output: { "approved": true/false, "reason": "string" }
```

## 📱 API Endpoints

### Create Carrier (Registration)
```
POST /api/sync-salesforce
Body: {
  user_id, email, company_name, ein, dot_number,
  zip_code, cargo_policy, auto_policy
}
Response: { carrier_id, status: "pending_screening" }
```

### Trigger Screening Agent
```
POST /api/vetting/screening-check
Body: { carrier_id, dot_number }
Response: { approved: boolean, reason: string }
```

### Update Load Status (Tracking)
```
POST /api/loads/update-status
Body: { load_id, status: "In-Transit"|"Delayed"|"Delivered", gps_data }
Response: { success: boolean, updated_at: timestamp }
```

## ⏱️ Deployment Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| 1. Salesforce Setup | Week 1 | Custom objects, fields, indexes |
| 2. Integration User | Week 1-2 | API credentials, Connected App |
| 3. Config & Testing | Week 2 | Env vars, connection verification |
| 4. Data Migration | Week 3 | Airtable → Salesforce bulk load |
| 5. Agent Setup | Week 4 | Install plugin, create 6 agents |
| 6. Full Testing | Week 4 | Unit, integration, E2E tests |
| 7. Production Cutover | Week 5 | Deploy, monitor, decommission Airtable |

## 🚨 Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| `Authentication failed` | Bad credentials | Verify Connected App is authorized, refresh token |
| `INVALID_FIELD` | Wrong field API name | Check Salesforce Object Inspector, field names case-sensitive |
| `Rate limit exceeded` | Too many API calls | Implement queue, batch requests, increase rate limits |
| `Connection timeout` | Instance URL wrong or service down | Verify URL format, test with `sf status` |
| `Dify plugin auth failed` | Stale token | Re-authenticate OAuth, refresh credentials |

## 📈 Performance Targets

- Screening query: < 100ms (indexed)
- Matchmaking query: < 500ms (ordered)
- Tracking update: < 1s (real-time)
- Forecasting analysis: < 5s (100 records)
- Agent response time: < 3s (end-to-end)

## 🔐 Security Checklist

- [ ] Never hardcode credentials
- [ ] Use OAuth2 in production
- [ ] Enable Salesforce Audit Trail
- [ ] Log all agent executions to Agent_Workflow__c
- [ ] Restrict integration user to API-only profile
- [ ] Use field-level security (FLS) on sensitive fields
- [ ] Rotate credentials quarterly

## 📞 Support Resources

- **Salesforce Docs**: https://developer.salesforce.com/
- **jsforce GitHub**: https://github.com/jsforce/jsforce
- **Dify Docs**: https://docs.dify.ai/
- **SOQL Reference**: https://developer.salesforce.com/docs/atlas.en-us.soql_sosl.meta/soql_sosl/

---

**Print this page and keep at your desk during implementation!**


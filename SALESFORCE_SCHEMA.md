# Hitchyard Salesforce Schema Migration

## Purpose
Define Salesforce Custom Objects and Fields as the **Single Source of Truth** for Hitchyard business logic, replacing Airtable for carrier vetting, load tracking, and agent orchestration.

## Custom Objects & Field Definitions

### 1. Carrier__c (Custom Object)
Represents carrier profiles with vetting status, trust scoring, and insurance tracking.

| Field Name | API Name | Type | Length | Required | Description |
|------------|----------|------|--------|----------|-------------|
| Carrier Name | Name | Text | 255 | Yes | Carrier company name |
| Supabase ID | Supabase_ID__c | Text | 255 | Yes | Foreign key to user_profiles |
| DOT Number | DOT_Number__c | Text | 20 | No | Department of Transportation number |
| EIN | EIN__c | Text | 20 | No | Employer Identification Number |
| Safety Status | Safety_Status__c | Picklist | - | Yes | **Values**: Active, Pending, Manual Review |
| Trust Score | Trust_Score__c | Number | 3,0 | Yes | Range 0-100 (default: 0) |
| Insurance Expiration | Insurance_Expiration__c | Date | - | No | Policy expiration date |
| Performance On-Time Rate | Performance_OnTime_Rate__c | Percent | - | No | Historical on-time delivery % |
| Last Vetting Check | Last_Vetting_Check__c | Date/Time | - | No | Timestamp of last ansonia credit check |
| Credit Score (Ansonia) | Ansonia_Credit_Score__c | Number | 3,0 | No | Equifax Ansonia score (0-100) |
| Days to Pay (DTP) | Ansonia_DTP_Days__c | Number | 3,0 | No | Historical average days to pay |

**Indexes**: `Safety_Status__c`, `Trust_Score__c`, `Supabase_ID__c`

---

### 2. Load__c (Custom Object)
Represents freight loads with routing, status, and pricing.

| Field Name | API Name | Type | Length | Required | Description |
|------------|----------|------|--------|----------|-------------|
| Load Number | Load_Number__c | Text | 50 | Yes | Unique identifier (e.g., LG-2025-0001) |
| Shipper ID | Shipper_ID__c | Text | 255 | Yes | Foreign key to shipper account |
| Carrier ID | Carrier_ID__c | Lookup | - | No | Related Carrier__c record |
| Live Status | Live_Status__c | Picklist | - | Yes | **Values**: Pending, In-Transit, Delayed, Delivered |
| Origin City | Origin_City__c | Text | 100 | Yes | Pickup location |
| Origin State | Origin_State__c | Text | 2 | Yes | Origin state code |
| Destination City | Destination_City__c | Text | 100 | Yes | Delivery location |
| Destination State | Destination_State__c | Text | 2 | Yes | Destination state code |
| Lane Data | Lane_Data__c | Text Area (Long) | - | No | JSON: `{"route_id", "mileage", "est_hours"}` |
| Market Rate Suggested | Market_Rate_Suggested__c | Currency | 16,2 | No | AI-determined market rate |
| Bid Rate Accepted | Bid_Rate_Accepted__c | Currency | 16,2 | No | Final negotiated rate |
| Created Date | CreatedDate | Date/Time | - | Auto | Salesforce timestamp |
| Last GPS Update | Last_GPS_Update__c | Date/Time | - | No | Most recent location ping |
| Estimated Delivery | Estimated_Delivery__c | Date/Time | - | No | ETA at destination |
| Actual Delivery | Actual_Delivery__c | Date/Time | - | No | Actual delivery timestamp |

**Indexes**: `Live_Status__c`, `Lane_Data__c`, `Carrier_ID__c`

---

### 3. Agent_Workflow__c (Custom Object - Optional)
Tracks agent execution logs for auditability.

| Field Name | API Name | Type | Length | Required | Description |
|------------|----------|------|--------|----------|-------------|
| Workflow Type | Workflow_Type__c | Picklist | - | Yes | **Values**: Screening, Matchmaking, Tracking, Forecasting, Exception, Onboarding |
| Related Load | Related_Load__c | Lookup | - | No | Related Load__c record |
| Related Carrier | Related_Carrier__c | Lookup | - | No | Related Carrier__c record |
| Execution Status | Execution_Status__c | Picklist | - | Yes | **Values**: Started, In Progress, Completed, Failed |
| Action Taken | Action_Taken__c | Text Area | - | No | Description of agent action |
| Timestamp | CreatedDate | Date/Time | - | Auto | When workflow executed |

---

## Schema Relationships

```
Carrier__c
  ├── Links to: user_profiles (via Supabase_ID__c)
  └── Reverse Lookup: Load__c (Carrier_ID__c → Carrier__c)

Load__c
  ├── Links to: Carrier__c (via Carrier_ID__c)
  ├── Links to: shipper account (via Shipper_ID__c)
  └── Parent to: Agent_Workflow__c (logs)

Agent_Workflow__c
  ├── Related to: Load__c (audit trail)
  └── Related to: Carrier__c (agent actions)
```

---

## SOQL Query Examples

### Find Active Carriers
```soql
SELECT Id, Name, Trust_Score__c, Performance_OnTime_Rate__c 
FROM Carrier__c 
WHERE Safety_Status__c = 'Active' AND Insurance_Expiration__c >= TODAY
ORDER BY Trust_Score__c DESC
```

### Find In-Transit Loads
```soql
SELECT Id, Load_Number__c, Live_Status__c, Carrier_ID__c, Last_GPS_Update__c 
FROM Load__c 
WHERE Live_Status__c = 'In-Transit'
ORDER BY Last_GPS_Update__c DESC
```

### Find Delayed Loads (Exception Agent Trigger)
```soql
SELECT Id, Load_Number__c, Carrier_ID__c, Estimated_Delivery__c 
FROM Load__c 
WHERE Live_Status__c = 'Delayed' AND CreatedDate = LAST_N_DAYS:7
```

### Carrier Performance History
```soql
SELECT COUNT(), AVG(Performance_OnTime_Rate__c) 
FROM Carrier__c 
WHERE Safety_Status__c = 'Active'
GROUP BY Safety_Status__c
```

---

## Integration Points with Dify Agents

### Screening Agent (Verification)
- **SOQL Query**: `SELECT Id, Safety_Status__c, Insurance_Expiration__c FROM Carrier__c WHERE DOT_Number__c = :dotNumber`
- **Decision Logic**: `Safety_Status__c == 'Active' && Insurance_Expiration__c > TODAY`
- **Action**: Create/Update Agent_Workflow__c record with Screening result

### Matchmaking Agent (Trust Ranking)
- **SOQL Query**: `SELECT Id, Trust_Score__c, Performance_OnTime_Rate__c FROM Carrier__c WHERE Safety_Status__c = 'Active' ORDER BY Trust_Score__c DESC LIMIT 10`
- **Action**: Rank carriers, create Load__c assignment, log to Agent_Workflow__c

### Tracking Agent (Visibility)
- **Update**: `UPDATE Load__c SET Live_Status__c = 'In-Transit', Last_GPS_Update__c = NOW WHERE Id = :loadId`
- **Query**: Real-time reads of Load__c for dashboard sync via Supabase + Salesforce webhooks

### Forecasting Agent (Dynamic Pricing)
- **SOQL Query**: `SELECT Lane_Data__c, Bid_Rate_Accepted__c FROM Load__c WHERE Lane_Data__c INCLUDES (:origin, :destination)`
- **Action**: Calculate Market_Rate_Suggested__c, update Load__c

### Exception Agent (Recovery)
- **SOQL Query**: `SELECT Id, Carrier_ID__c FROM Load__c WHERE Live_Status__c = 'Delayed' AND LastModifiedDate = LAST_N_MINUTES:30`
- **Action**: Trigger Matchmaking Agent, reassign to new carrier, update Load__c.Carrier_ID__c

### Onboarding Agent (Vetting)
- **Action**: Create Carrier__c record with initial fields, store W-9/Insurance URLs in Salesforce Files
- **Update**: Set Safety_Status__c = 'Pending', trigger Screening Agent

---

## Deployment Steps

1. **Create Custom Objects** in Salesforce Setup → Object Manager
2. **Create Custom Fields** for each object (use API names exactly as defined)
3. **Enable API Access** for integration user
4. **Create Salesforce Integration User** with API credentials
5. **Configure Environment Variables** (see `.env.example`)
6. **Deploy Dify Salesforce Plugin** (Marketplace)
7. **Update Next.js App** to use Salesforce instead of Airtable
8. **Run Data Migration** from Airtable → Salesforce (batch job)

---

## Environment Variables Required

```env
# Salesforce OAuth
SALESFORCE_CLIENT_ID=your_connected_app_client_id
SALESFORCE_CLIENT_SECRET=your_connected_app_secret
SALESFORCE_USERNAME=your_integration_user@hitchyard.com
SALESFORCE_PASSWORD=your_integration_password
SALESFORCE_SECURITY_TOKEN=your_security_token
SALESFORCE_INSTANCE_URL=https://your-instance.salesforce.com

# Alternative: Direct API Token (if using refresh token flow)
SALESFORCE_API_TOKEN=refresh_token_value

# Dify Marketplace
DIFY_API_KEY=your_dify_api_key
DIFY_BASE_URL=https://your-dify-instance.com/api
```

---

## Migration Strategy

### Phase 1: Setup (Week 1)
- Create Salesforce objects and fields
- Provision integration user
- Configure API access

### Phase 2: Integration Layer (Week 2)
- Build jsforce wrapper in `lib/salesforceClient.ts`
- Create Dify plugin for Salesforce
- Update Next.js API routes

### Phase 3: Data Migration (Week 3)
- Export Airtable data
- Transform to Salesforce schema
- Bulk insert via Salesforce API

### Phase 4: Agent Testing (Week 4)
- Test each Dify agent against Salesforce
- Validate SOQL queries
- Stress test concurrency

### Phase 5: Cutover (Week 5)
- Redirect all API calls from Airtable → Salesforce
- Monitor logs and dashboards
- Decommission Airtable sync endpoint

---

## Audit & Compliance

- **Agent_Workflow__c** logs all agent actions for regulatory compliance
- **Salesforce Audit Trail** captures all field changes with timestamps
- **Carrier__c record history** tracked via Setup → History Tracking
- **Load__c delivery proofs** linked to Salesforce Files (W-9, BOL, GPS records)


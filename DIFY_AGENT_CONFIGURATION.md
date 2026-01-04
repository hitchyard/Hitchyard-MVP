# Dify Agent Orchestration for Salesforce Integration

## Agent System Architecture

The Hitchyard Dify agent system has been redesigned to use Salesforce as the Single Source of Truth. Each agent corresponds to a critical workflow in the freight matching pipeline.

---

## 1. SCREENING AGENT (Verification)

**Purpose**: Validate carrier credentials and compliance status.

**Trigger**: New carrier registration or periodic vetting review.

**Salesforce SOQL**:
```soql
SELECT Id, Safety_Status__c, Insurance_Expiration__c, Ansonia_Credit_Score__c
FROM Carrier__c
WHERE DOT_Number__c = :dotNumber
```

**Agent Logic Flow**:
```
Input: { carrierId, dotNumber }
  ↓
1. Query Salesforce Carrier__c by DOT_Number__c
2. Validate: Safety_Status__c == 'Active'?
3. Validate: Insurance_Expiration__c > TODAY?
4. If both true → APPROVED
5. Else → ESCALATE to manual review
  ↓
Output: 
{
  approved: boolean,
  reason: string,
  safety_status: string,
  insurance_valid: boolean,
  review_flag?: string
}
```

**Dify Configuration (Yaml)**:
```yaml
name: "Screening Agent"
description: "Verify carrier qualifications against Salesforce records"
model: "gpt-4"
temperature: 0.3
max_tokens: 500

tools:
  - name: "query_carrier_salesforce"
    type: "salesforce_connector"
    config:
      sobject: "Carrier__c"
      query_fields: ["Id", "Safety_Status__c", "Insurance_Expiration__c"]
      filter: "DOT_Number__c = '{{dot_number}}'"

prompt: |
  You are a freight carrier compliance officer. 
  
  Review this carrier profile from Salesforce:
  {{carrier_record}}
  
  Determine if they meet Hitchyard standards:
  1. Safety Status must be 'Active'
  2. Insurance expiration must be in the future
  3. Ansonia credit score should be >= 70
  
  Provide a RECOMMENDATION (APPROVED/ESCALATE).
```

---

## 2. MATCHMAKING AGENT (Trust Ranking)

**Purpose**: Match loads with carriers based on trust score, performance, and capacity.

**Trigger**: New load posted by shipper.

**Salesforce SOQL**:
```soql
SELECT Id, Name, Trust_Score__c, Performance_OnTime_Rate__c, 
       Insurance_Expiration__c, Ansonia_Credit_Score__c
FROM Carrier__c
WHERE Safety_Status__c = 'Active'
  AND Insurance_Expiration__c >= TODAY
ORDER BY Trust_Score__c DESC
LIMIT 20
```

**Agent Logic Flow**:
```
Input: { loadId, originState, destinationState, shipperTier }
  ↓
1. Query Salesforce Load__c where Id = loadId
2. Extract lane data (origin → destination)
3. Query active Carrier__c ordered by Trust_Score__c DESC
4. Rank carriers:
   - Trust_Score__c > 85 → TIER_1_ELITE (premium)
   - Trust_Score__c 70-85 → TIER_2_STANDARD (approved)
   - Trust_Score__c < 70 → TIER_3_EMERGING (reviewed)
5. Filter by shipper tier requirements
6. Update Load__c.Carrier_ID__c with top match
  ↓
Output:
{
  top_carrier_id: string,
  ranked_list: [{ id, name, trust_score, tier }],
  market_rate: currency,
  estimated_pickup: timestamp
}
```

**Dify Configuration (Yaml)**:
```yaml
name: "Matchmaking Agent"
description: "Rank carriers and assign to loads based on trust metrics"
model: "gpt-4"
temperature: 0.5
max_tokens: 1000

tools:
  - name: "query_load_salesforce"
    type: "salesforce_connector"
    config:
      sobject: "Load__c"
      query_fields: ["Id", "Lane_Data__c", "Origin_State__c", "Destination_State__c"]

  - name: "query_active_carriers"
    type: "salesforce_connector"
    config:
      sobject: "Carrier__c"
      query_fields: ["Id", "Name", "Trust_Score__c", "Performance_OnTime_Rate__c"]
      filter: "Safety_Status__c = 'Active' AND Insurance_Expiration__c >= TODAY"
      order_by: "Trust_Score__c DESC"
      limit: 20

  - name: "update_load_assignment"
    type: "salesforce_connector"
    config:
      sobject: "Load__c"
      action: "update"
      fields: ["Carrier_ID__c"]

prompt: |
  You are a freight matchmaking specialist.
  
  Load Details:
  {{load_record}}
  
  Available Carriers (ranked by trust):
  {{active_carriers}}
  
  Your task:
  1. Recommend the TOP 3 carriers for this load
  2. Explain your reasoning based on:
     - Trust Score (historical reliability)
     - On-Time Performance Rate
     - Lane familiarity (historical loads on this route)
  3. Assign the top carrier to the load
  4. Suggest market rate based on historical lane data
  
  Output JSON:
  {
    "primary_carrier_id": "string",
    "ranked_list": [...],
    "market_rate": number,
    "confidence": 0-100
  }
```

---

## 3. TRACKING AGENT (Visibility)

**Purpose**: Monitor load status in real-time and update Salesforce with GPS/status changes.

**Trigger**: Scheduled (every 5 minutes) + GPS ping received.

**Salesforce Operations**:
```
Read: Load__c.Live_Status__c, Load__c.Last_GPS_Update__c
Write: UPDATE Load__c SET Live_Status__c, Last_GPS_Update__c
```

**Agent Logic Flow**:
```
Input: { loadId, gpsData? }
  ↓
1. If GPS received:
     a. Update Load__c.Last_GPS_Update__c = NOW
     b. Calculate ETA based on current location
     c. Update Load__c.Estimated_Delivery__c
2. Query Load__c.Live_Status__c
3. If status not yet 'In-Transit' → Set to 'In-Transit'
4. If geolocation near destination → Prepare delivery alert
  ↓
Output:
{
  status: "In-Transit" | "Delayed" | "Delivered",
  current_location: { lat, lng },
  miles_remaining: number,
  eta: timestamp,
  updated_at: timestamp
}
```

**Dify Configuration (Yaml)**:
```yaml
name: "Tracking Agent"
description: "Monitor loads and update status in real-time"
model: "gpt-4"
temperature: 0.2
max_tokens: 300

tools:
  - name: "get_load_status"
    type: "salesforce_connector"
    config:
      sobject: "Load__c"
      query_fields: ["Id", "Live_Status__c", "Last_GPS_Update__c", "Estimated_Delivery__c"]

  - name: "update_load_status"
    type: "salesforce_connector"
    config:
      sobject: "Load__c"
      action: "update"
      fields: ["Live_Status__c", "Last_GPS_Update__c", "Estimated_Delivery__c"]

  - name: "get_gps_data"
    type: "http_request"
    config:
      url: "{{gps_provider_api}}"
      method: "POST"
      body: '{"load_id": "{{load_id}}"}'

prompt: |
  Track this load's progress:
  {{load_record}}
  
  GPS Data:
  {{gps_data}}
  
  Update the load status:
  1. Set Live_Status__c = "In-Transit"
  2. Update Last_GPS_Update__c to current time
  3. Calculate ETA to destination
  4. Flag as "Delayed" if ETA > original Estimated_Delivery__c
```

---

## 4. FORECASTING AGENT (Dynamic Pricing)

**Purpose**: Analyze historical lane data to suggest market rates and predict demand.

**Trigger**: Before load posting; triggered by Matchmaking Agent.

**Salesforce SOQL**:
```soql
SELECT Lane_Data__c, Bid_Rate_Accepted__c, CreatedDate, 
       (Actual_Delivery__c - CreatedDate) as Days_to_Delivery
FROM Load__c
WHERE Origin_State__c = 'AZ' AND Destination_State__c = 'UT'
  AND Live_Status__c = 'Delivered'
ORDER BY CreatedDate DESC
LIMIT 100
```

**Agent Logic Flow**:
```
Input: { originState, destinationState, weight?, hazmat? }
  ↓
1. Query historical Load__c records for this lane
2. Calculate:
   - Average bid rate (Bid_Rate_Accepted__c)
   - Market volatility (std deviation of rates)
   - Seasonal factors (date analysis)
   - Environmental factors (weather, fuel prices)
3. Generate Market_Rate_Suggested__c
4. Adjust for current conditions
  ↓
Output:
{
  suggested_rate: currency,
  rate_range: { min, max },
  confidence: 0-100,
  historical_avg: currency,
  trend: "up" | "down" | "stable"
}
```

**Dify Configuration (Yaml)**:
```yaml
name: "Forecasting Agent"
description: "Predict market rates based on historical lane data"
model: "gpt-4"
temperature: 0.4
max_tokens: 600

tools:
  - name: "get_lane_history"
    type: "salesforce_connector"
    config:
      sobject: "Load__c"
      query_fields: ["Lane_Data__c", "Bid_Rate_Accepted__c", "CreatedDate"]
      filter: "Origin_State__c = '{{origin_state}}' AND Destination_State__c = '{{dest_state}}'"
      limit: 100

  - name: "get_market_data"
    type: "http_request"
    config:
      url: "https://api.freightos.com/v1/rates"
      method: "GET"
      params: { origin: "{{origin}}", destination: "{{destination}}" }

prompt: |
  Historical lane data for {{origin_state}} → {{dest_state}}:
  {{lane_history}}
  
  Current market data:
  {{market_data}}
  
  Suggest a fair market rate:
  1. Calculate average from historical loads
  2. Adjust for market trends
  3. Consider seasonal volatility
  4. Provide confidence score
  
  Output:
  {
    "suggested_rate": number,
    "min_rate": number,
    "max_rate": number,
    "confidence": 0-100,
    "reasoning": "string"
  }
```

---

## 5. EXCEPTION AGENT (Recovery)

**Purpose**: Monitor for failures and trigger recovery workflows.

**Trigger**: Load status = 'Delayed' or pickup not completed by ETA.

**Salesforce SOQL**:
```soql
SELECT Id, Load_Number__c, Carrier_ID__c, Estimated_Delivery__c, Live_Status__c
FROM Load__c
WHERE Live_Status__c = 'Delayed'
  AND CreatedDate = LAST_N_DAYS:7
ORDER BY LastModifiedDate DESC
```

**Agent Logic Flow**:
```
Input: { delayedLoadId }
  ↓
1. Query Load__c details
2. Query assigned Carrier__c performance
3. Decision tree:
   a. Carrier Trust_Score__c < 60? → REASSIGN
   b. Delay > 4 hours? → TRIGGER BACKUP
   c. Shipper high-tier? → ESCALATE to manager
4. If REASSIGN:
   - Query next-best Carrier__c
   - Call Matchmaking Agent for replacement
   - Update Load__c.Carrier_ID__c
   - Notify shipper and carrier
  ↓
Output:
{
  action_taken: "reassigned" | "escalated" | "notified",
  new_carrier_id?: string,
  escalation_ticket?: string,
  eta_revised?: timestamp
}
```

**Dify Configuration (Yaml)**:
```yaml
name: "Exception Agent"
description: "Handle load delays and trigger recovery"
model: "gpt-4"
temperature: 0.6
max_tokens: 800

tools:
  - name: "get_delayed_loads"
    type: "salesforce_connector"
    config:
      sobject: "Load__c"
      query_fields: ["Id", "Load_Number__c", "Carrier_ID__c", "Live_Status__c"]
      filter: "Live_Status__c = 'Delayed' AND CreatedDate = LAST_N_DAYS:7"

  - name: "get_carrier_info"
    type: "salesforce_connector"
    config:
      sobject: "Carrier__c"
      query_fields: ["Id", "Name", "Trust_Score__c", "Performance_OnTime_Rate__c"]

  - name: "call_matchmaking_agent"
    type: "dify_agent_reference"
    config:
      agent_name: "Matchmaking Agent"

  - name: "reassign_load"
    type: "salesforce_connector"
    config:
      sobject: "Load__c"
      action: "update"
      fields: ["Carrier_ID__c"]

  - name: "send_notification"
    type: "http_request"
    config:
      url: "{{notification_service_url}}"
      method: "POST"

prompt: |
  This load has been delayed:
  {{load_details}}
  
  Current carrier performance:
  {{carrier_info}}
  
  Determine the best recovery action:
  1. If carrier trust score < 60 → RECOMMEND REASSIGNMENT
  2. If delay > 4 hours → ESCALATE
  3. Otherwise → NOTIFY and MONITOR
  
  Take corrective action (if reassign):
  - Trigger Matchmaking Agent for backup carrier
  - Update Salesforce with new assignment
```

---

## 6. ONBOARDING AGENT (Vetting)

**Purpose**: Guide new carriers through vetting process and document compliance.

**Trigger**: New user registration.

**Salesforce Actions**:
```
Create: Carrier__c record
Attach: Files (W-9, Insurance) to Carrier record
Update: Safety_Status__c = 'Pending'
```

**Agent Logic Flow**:
```
Input: { userId, email, companyName, dotNumber, ein }
  ↓
1. Create Carrier__c record in Salesforce
   - Name = companyName
   - Supabase_ID__c = userId
   - DOT_Number__c = dotNumber
   - EIN__c = ein
   - Safety_Status__c = 'Pending'
   - Trust_Score__c = 0
2. Request W-9 form
3. Request Insurance Certificate
4. Store documents in Salesforce Files (linked to Carrier__c)
5. Call Screening Agent to verify DOT/EIN
6. Update Safety_Status__c based on verification
  ↓
Output:
{
  carrier_id: string,
  onboarding_status: "in-progress" | "pending-docs" | "vetting" | "complete",
  required_docs: [string],
  next_step: string
}
```

**Dify Configuration (Yaml)**:
```yaml
name: "Onboarding Agent"
description: "Onboard new carriers and collect compliance docs"
model: "gpt-4"
temperature: 0.7
max_tokens: 1200

tools:
  - name: "create_carrier_salesforce"
    type: "salesforce_connector"
    config:
      sobject: "Carrier__c"
      action: "create"
      fields: ["Name", "Supabase_ID__c", "DOT_Number__c", "EIN__c", "Safety_Status__c"]

  - name: "request_document"
    type: "email_template"
    config:
      template: "w9_insurance_request"

  - name: "upload_file_salesforce"
    type: "salesforce_connector"
    config:
      sobject: "Carrier__c"
      action: "attach_file"

  - name: "call_screening_agent"
    type: "dify_agent_reference"
    config:
      agent_name: "Screening Agent"

  - name: "update_carrier_status"
    type: "salesforce_connector"
    config:
      sobject: "Carrier__c"
      action: "update"
      fields: ["Safety_Status__c", "Trust_Score__c"]

prompt: |
  Welcome {{company_name}} to Hitchyard!
  
  I'll help you complete onboarding. Let's collect:
  1. W-9 Form (for tax purposes)
  2. Insurance Certificate (proof of coverage)
  3. Verify your DOT and EIN with the Screening Agent
  
  Once complete, your profile will be active.
  
  Current Status: {{onboarding_status}}
  Required Documents: {{required_docs}}
```

---

## Integration Pattern: Agent-to-Agent Communication

Agents can reference each other's outputs:

```yaml
# Example: Matchmaking Agent calling Forecasting Agent
tools:
  - name: "get_market_rate"
    type: "dify_agent_reference"
    config:
      agent_name: "Forecasting Agent"
      inputs:
        origin_state: "{{load.origin_state}}"
        dest_state: "{{load.dest_state}}"
      timeout: 30s

# In prompt:
Market rate from Forecasting Agent:
{{market_rate_output}}

Use this to inform carrier matching...
```

---

## Salesforce Plugin Installation (Dify Marketplace)

### Step 1: Install Salesforce Connector Plugin
```bash
# In Dify admin panel:
Marketplace → Search "Salesforce" → Install
```

### Step 2: Configure API Credentials
```yaml
Plugin Config:
  client_id: "{{ SALESFORCE_CLIENT_ID }}"
  client_secret: "{{ SALESFORCE_CLIENT_SECRET }}"
  username: "{{ SALESFORCE_USERNAME }}"
  password: "{{ SALESFORCE_PASSWORD }}"
  security_token: "{{ SALESFORCE_SECURITY_TOKEN }}"
  instance_url: "{{ SALESFORCE_INSTANCE_URL }}"
```

### Step 3: Enable Tools in Agents
- Each agent YAML references `type: "salesforce_connector"`
- Dify plugin automatically handles SOQL compilation and DML execution

---

## Deployment Checklist

- [ ] Salesforce custom objects created (Carrier__c, Load__c, Agent_Workflow__c)
- [ ] Salesforce integration user provisioned with API credentials
- [ ] jsforce library installed in Next.js project
- [ ] Environment variables configured (.env.local)
- [ ] Dify Salesforce plugin installed from Marketplace
- [ ] All 6 agent YAMLs created in Dify
- [ ] Agent-to-agent references tested
- [ ] Workflow logging to Agent_Workflow__c validated
- [ ] Airtable sync endpoint deprecated (keep for fallback)
- [ ] Load tests run (concurrent carrier queries, bulk updates)


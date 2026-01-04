# Dify Salesforce Plugin Configuration

## Overview

This guide provides step-by-step instructions for installing and configuring the Salesforce plugin in Dify, enabling AI agents to query and manipulate Salesforce data in real-time.

---

## Installation Steps

### Step 1: Access Dify Marketplace

1. Login to your Dify instance: `https://your-dify-instance.com`
2. Navigate to: **Admin Dashboard** → **Marketplace**
3. Search: `"Salesforce"` or `"Salesforce CRM"`

### Step 2: Install Salesforce Connector Plugin

1. Click **Install** on the Salesforce plugin
2. Confirm installation (plugin will be downloaded and activated)
3. You should see confirmation: `"Salesforce plugin installed successfully"`

---

## Credential Configuration

### Method 1: OAuth2 (Recommended for Production)

#### Step 1: Create Connected App in Salesforce

In Salesforce Setup → Apps → App Manager:

1. Click **New Connected App**
2. Fill in:
   - **Connected App Name**: `Dify Agent Hub`
   - **API Name**: `Dify_Agent_Hub`
   - **Contact Email**: your@email.com

3. Enable OAuth Settings:
   - **Callback URL**: `https://your-dify-instance.com/integrations/salesforce/oauth/callback`
   - **Selected OAuth Scopes**:
     - `api` (allows all API access)
     - `refresh_token` (for token refresh)
     - `offline_access`

4. Save → Copy **Client ID** and **Client Secret**

#### Step 2: Authorize in Dify

1. In Dify → Marketplace → Salesforce Plugin → **Settings**
2. Click **Connect with OAuth**
3. Enter:
   - **Client ID**: `your-client-id`
   - **Client Secret**: `your-client-secret`
   - **Instance URL**: `https://your-instance.salesforce.com`
4. Click **Authorize** → Redirect to Salesforce login
5. Approve access → Redirect back to Dify (tokens stored securely)

### Method 2: Username/Password + Security Token (Development)

1. In Dify → Marketplace → Salesforce Plugin → **Settings**
2. Select: **Username/Password Authentication**
3. Enter:
   - **Instance URL**: `https://your-instance.salesforce.com`
   - **Username**: `integration-user@hitchyard.sandbox.my.salesforce.com`
   - **Password**: `your-password`
   - **Security Token**: `your-security-token-from-email` (if required)
4. Click **Test Connection**
5. Expected: `"Connection successful"`

---

## Plugin Configuration in Agents

### Generic Salesforce Tool

Available in any Dify Agent:

```yaml
tools:
  - name: "salesforce_query"
    type: "salesforce_connector"
    config:
      method: "query"
      sobject: "Carrier__c"  # or Load__c, Account, etc.
      fields: ["Id", "Name", "Trust_Score__c"]
      where: "Safety_Status__c = 'Active'"
      order_by: "Trust_Score__c DESC"
      limit: 10
```

### Predefined Tool: Query Carriers

```yaml
tools:
  - name: "query_active_carriers"
    type: "salesforce_connector"
    description: "Fetch carriers with active status and high trust scores"
    config:
      method: "query"
      sobject: "Carrier__c"
      fields: 
        - "Id"
        - "Name"
        - "Trust_Score__c"
        - "Performance_OnTime_Rate__c"
        - "Insurance_Expiration__c"
      where: |
        Safety_Status__c = 'Active' 
        AND Insurance_Expiration__c >= TODAY
      order_by: "Trust_Score__c DESC"
      limit: 20
```

### Predefined Tool: Create/Update Record

```yaml
tools:
  - name: "create_carrier"
    type: "salesforce_connector"
    description: "Create new Carrier record in Salesforce"
    config:
      method: "create"
      sobject: "Carrier__c"
      fields:
        Name: "{{ carrier_name }}"
        Supabase_ID__c: "{{ user_id }}"
        DOT_Number__c: "{{ dot_number }}"
        EIN__c: "{{ ein }}"
        Safety_Status__c: "Pending"
        Trust_Score__c: 0
```

### Predefined Tool: Update Record

```yaml
tools:
  - name: "update_carrier_vetting"
    type: "salesforce_connector"
    description: "Update carrier vetting status after compliance check"
    config:
      method: "update"
      sobject: "Carrier__c"
      record_id: "{{ carrier_id }}"
      fields:
        Safety_Status__c: "{{ new_status }}"
        Trust_Score__c: "{{ new_score }}"
        Last_Vetting_Check__c: "{{ now }}"
        Ansonia_Credit_Score__c: "{{ credit_score }}"
```

---

## Agent-Specific Configurations

### 1. Screening Agent

**Purpose**: Verify carrier credentials in Salesforce

```yaml
name: "Screening Agent"
type: "agent"
model: "gpt-4"
temperature: 0.3

tools:
  - name: "query_carrier"
    type: "salesforce_connector"
    config:
      method: "query"
      sobject: "Carrier__c"
      fields: ["Id", "Safety_Status__c", "Insurance_Expiration__c", "Ansonia_Credit_Score__c"]
      where: "DOT_Number__c = '{{ dot_number }}'"

prompt: |
  You are a compliance officer. Review this Salesforce carrier record:
  {{ query_carrier_result }}
  
  Verify:
  1. Safety_Status__c == 'Active'
  2. Insurance_Expiration__c > TODAY
  3. Ansonia_Credit_Score__c >= 70
  
  Output: { "approved": true/false, "reason": "string" }
```

### 2. Matchmaking Agent

**Purpose**: Rank carriers and assign to loads

```yaml
name: "Matchmaking Agent"
type: "agent"
model: "gpt-4"
temperature: 0.5

tools:
  - name: "get_load_details"
    type: "salesforce_connector"
    config:
      method: "query"
      sobject: "Load__c"
      fields: ["Id", "Origin_State__c", "Destination_State__c", "Lane_Data__c"]
      where: "Id = '{{ load_id }}'"

  - name: "find_carriers"
    type: "salesforce_connector"
    config:
      method: "query"
      sobject: "Carrier__c"
      fields: ["Id", "Name", "Trust_Score__c", "Performance_OnTime_Rate__c"]
      where: "Safety_Status__c = 'Active' AND Insurance_Expiration__c >= TODAY"
      order_by: "Trust_Score__c DESC"
      limit: 20

  - name: "assign_carrier"
    type: "salesforce_connector"
    config:
      method: "update"
      sobject: "Load__c"
      record_id: "{{ load_id }}"
      fields:
        Carrier_ID__c: "{{ selected_carrier_id }}"

prompt: |
  Load Details: {{ get_load_details_result }}
  Available Carriers (ranked): {{ find_carriers_result }}
  
  Recommend and assign the best carrier.
  Output: { "carrier_id": "string", "reasoning": "string" }
```

### 3. Tracking Agent

**Purpose**: Monitor load status in real-time

```yaml
name: "Tracking Agent"
type: "agent"
model: "gpt-4"
temperature: 0.2
polling_interval: 5m  # Check every 5 minutes

tools:
  - name: "get_load_status"
    type: "salesforce_connector"
    config:
      method: "query"
      sobject: "Load__c"
      fields: ["Id", "Live_Status__c", "Last_GPS_Update__c", "Estimated_Delivery__c"]
      where: "Live_Status__c IN ('Pending', 'In-Transit')"

  - name: "update_status"
    type: "salesforce_connector"
    config:
      method: "update"
      sobject: "Load__c"
      record_id: "{{ load_id }}"
      fields:
        Live_Status__c: "{{ new_status }}"
        Last_GPS_Update__c: "{{ now }}"

  - name: "get_gps_data"
    type: "http_request"
    config:
      url: "{{ GPS_PROVIDER_URL }}/loads/{{ load_id }}"
      method: "GET"

prompt: |
  Check GPS for this load: {{ get_load_status_result }}
  Latest GPS: {{ get_gps_data_result }}
  
  Update status if needed. Flag as 'Delayed' if ETA exceeded.
```

### 4. Forecasting Agent

**Purpose**: Analyze historical data and predict rates

```yaml
name: "Forecasting Agent"
type: "agent"
model: "gpt-4"
temperature: 0.4

tools:
  - name: "get_lane_history"
    type: "salesforce_connector"
    config:
      method: "query"
      sobject: "Load__c"
      fields: ["Lane_Data__c", "Bid_Rate_Accepted__c", "CreatedDate"]
      where: |
        Origin_State__c = '{{ origin_state }}'
        AND Destination_State__c = '{{ dest_state }}'
        AND Live_Status__c = 'Delivered'
      order_by: "CreatedDate DESC"
      limit: 100

  - name: "update_suggested_rate"
    type: "salesforce_connector"
    config:
      method: "update"
      sobject: "Load__c"
      record_id: "{{ load_id }}"
      fields:
        Market_Rate_Suggested__c: "{{ suggested_rate }}"

prompt: |
  Historical lane data: {{ get_lane_history_result }}
  
  Calculate suggested market rate.
  Factor in seasonality, volatility, trends.
  Output: { "suggested_rate": number, "confidence": 0-100 }
```

### 5. Exception Agent

**Purpose**: Handle delays and trigger recovery

```yaml
name: "Exception Agent"
type: "agent"
model: "gpt-4"
temperature: 0.6

tools:
  - name: "find_delayed_loads"
    type: "salesforce_connector"
    config:
      method: "query"
      sobject: "Load__c"
      fields: ["Id", "Load_Number__c", "Carrier_ID__c", "Live_Status__c"]
      where: "Live_Status__c = 'Delayed' AND CreatedDate = LAST_N_DAYS:7"

  - name: "get_carrier_info"
    type: "salesforce_connector"
    config:
      method: "query"
      sobject: "Carrier__c"
      fields: ["Id", "Name", "Trust_Score__c"]
      where: "Id = '{{ carrier_id }}'"

  - name: "reassign_load"
    type: "salesforce_connector"
    config:
      method: "update"
      sobject: "Load__c"
      record_id: "{{ load_id }}"
      fields:
        Carrier_ID__c: "{{ new_carrier_id }}"
        Live_Status__c: "Pending"

prompt: |
  Delayed load: {{ find_delayed_loads_result }}
  Current carrier: {{ get_carrier_info_result }}
  
  If carrier trust score < 60, reassign to backup.
  Output: { "action": "reassigned" | "escalated", "reason": "string" }
```

### 6. Onboarding Agent

**Purpose**: Guide new carriers and collect documents

```yaml
name: "Onboarding Agent"
type: "agent"
model: "gpt-4"
temperature: 0.7

tools:
  - name: "create_carrier"
    type: "salesforce_connector"
    config:
      method: "create"
      sobject: "Carrier__c"
      fields:
        Name: "{{ company_name }}"
        Supabase_ID__c: "{{ user_id }}"
        DOT_Number__c: "{{ dot_number }}"
        EIN__c: "{{ ein }}"
        Safety_Status__c: "Pending"

  - name: "send_doc_request"
    type: "email_template"
    config:
      template: "request_w9_insurance"
      recipient: "{{ user_email }}"

  - name: "trigger_screening"
    type: "dify_agent_reference"
    config:
      agent_name: "Screening Agent"
      inputs: { carrier_id: "{{ carrier_id }}" }

prompt: |
  Welcome {{ company_name }} to Hitchyard!
  
  Steps:
  1. Create Salesforce record
  2. Request W-9 and Insurance docs
  3. Verify with Screening Agent
  4. Update status
  
  Keep user informed of progress.
```

---

## Testing the Configuration

### Test 1: Query Execution

```bash
curl -X POST https://your-dify-instance.com/api/agents/screening-agent/run \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "dot_number": "1234567",
    "model": "gpt-4"
  }'
```

Expected response:
```json
{
  "result": {
    "approved": true,
    "reason": "Carrier meets all compliance requirements"
  }
}
```

### Test 2: Create Record

```bash
curl -X POST https://your-dify-instance.com/api/agents/onboarding-agent/run \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Test Carrier LLC",
    "user_id": "test-123",
    "dot_number": "1234567",
    "ein": "12-3456789"
  }'
```

Expected: Carrier__c record created in Salesforce

### Test 3: Agent Chain (Onboarding → Screening)

Trigger Onboarding Agent, which should:
1. Create Carrier__c
2. Request docs
3. Call Screening Agent
4. Update status based on verification

---

## Troubleshooting

### Connection Issues

**Error**: `Authentication failed`
- Verify credentials in Dify plugin settings
- Check Salesforce Connected App is authorized
- Try re-authenticating with OAuth

**Error**: `INVALID_FIELD`
- Verify field API names are correct (case-sensitive)
- Check custom fields exist in Salesforce
- Use Salesforce Object Inspector to verify field names

### Rate Limiting

Salesforce API limits: 15,000 calls/24h (Developer Edition), 100,000 (Production)

Implement queue in agents:
```yaml
tools:
  - name: "queued_query"
    type: "salesforce_connector"
    config:
      method: "query"
      retry_on_limit: true
      retry_delay: 5000  # 5 seconds
```

### Timeout Issues

If queries take > 30s, increase timeout:
```yaml
tools:
  - name: "large_query"
    type: "salesforce_connector"
    config:
      method: "query"
      timeout: 60000  # 60 seconds
```

---

## Performance Best Practices

1. **Query Optimization**
   - Select only needed fields
   - Use WHERE clauses to filter early
   - Index frequently queried fields in Salesforce

2. **Batching**
   ```yaml
   # Batch 10 creates into single API call
   method: "batch_create"
   records: "{{ carrier_list }}"
   batch_size: 10
   ```

3. **Caching**
   - Cache frequently accessed objects
   - Set TTL on cached data
   ```yaml
   cache: true
   cache_ttl: 3600  # 1 hour
   ```

---

## Security Best Practices

1. **Credential Storage**
   - Always use environment variables
   - Never hardcode credentials in YAML
   - Use OAuth2 in production

2. **Field-Level Security**
   - Restrict fields visible to integration user profile
   - Use Salesforce FLS (Field-Level Security)

3. **Audit Trail**
   - Enable Salesforce Audit Trail
   - Monitor Agent_Workflow__c for all agent executions
   - Log all agent decisions

---

## Deployment Checklist

- [ ] Salesforce Connected App created
- [ ] OAuth2 credentials obtained
- [ ] Dify Salesforce plugin installed
- [ ] Plugin authenticated (OAuth or Username/Password)
- [ ] All 6 agent YAMLs configured
- [ ] Test queries executed successfully
- [ ] Rate limiting strategy implemented
- [ ] Audit logging enabled
- [ ] Production credentials deployed
- [ ] Monitoring alerts configured


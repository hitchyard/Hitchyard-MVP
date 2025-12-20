# Supabase Edge Function: check-carrier-credit

## Purpose
Automated carrier vetting via Ansonia (Equifax) Credit API.

## Trigger
Called when a carrier registers via registration endpoint.

## Flow
1. Receive `user_id`, `mc_number`, `dot_number`, `company_name`
2. Call Ansonia API with MC/DOT number
3. Fetch Global Credit Score (0-100) and Days to Pay (DTP)
4. Apply decision engine:
   - **85-100**: Set `vetting_status='ACTIVE'`, auto-approve
   - **70-84**: Set `vetting_status='PENDING'`, flag for manual review in Airtable
   - **<70**: Set `vetting_status='REJECTED'`, show "Imperial Standard Not Met"
5. Update `user_profiles` in Supabase
6. Return vetting result

## Environment Variables
Required in Supabase Edge Function settings:
- `ANSONIA_API_URL` - Ansonia API base URL
- `ANSONIA_API_KEY` - Ansonia API key
- `ANSONIA_ACCOUNT_ID` - Ansonia account ID
- `AIRTABLE_API_KEY` - Airtable API key (for manual review queue)
- `AIRTABLE_BASE_ID` - Airtable base ID
- `AIRTABLE_TABLE_NAME` - Airtable table name (default: "Manual Review Queue")
- `SUPABASE_URL` - Auto-provided
- `SUPABASE_SERVICE_ROLE_KEY` - Auto-provided

## Deployment
```bash
supabase functions deploy check-carrier-credit
```

## Testing
```bash
curl -X POST https://your-project.supabase.co/functions/v1/check-carrier-credit \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-uuid",
    "mc_number": "MC123456",
    "dot_number": "DOT789012",
    "company_name": "Test Trucking Inc"
  }'
```

## Response
```json
{
  "success": true,
  "vetting_status": "ACTIVE" | "PENDING" | "REJECTED",
  "trust_score": 85,
  "credit_score": 85,
  "dtp_days": 30,
  "requires_manual_review": false,
  "rejection_reason": null
}
```

# Stripe Payment Integration - Accept Bid Action

## Overview
The `acceptBidAction` has been updated to integrate Stripe payment processing with destination charges. When a shipper accepts a carrier's bid, the system now:

1. ✅ Verifies both shipper and carrier payment setup
2. ✅ Creates a Stripe Payment Intent
3. ✅ Charges the shipper's payment method
4. ✅ Transfers funds to the carrier's Stripe Connect account
5. ✅ Deducts a 15% application fee for Hitchyard
6. ✅ Updates the database with payment information

## Key Features

### Stripe Destination Charges
- **Payment Flow**: Shipper → Hitchyard Platform → Carrier (minus commission)
- **Commission Rate**: 15% application fee
- **Payment Method**: Off-session charge using stored payment method
- **Transfer Type**: Direct transfer to carrier's connected account

### Error Handling
- Validates shipper has payment method attached
- Validates carrier has Stripe Connect account set up
- Handles 3D Secure and additional authentication requirements
- Returns client secret if further confirmation needed

### Return Values

**Success Response:**
```typescript
{
  success: true,
  message: "Bid accepted, load assigned, and payment processed successfully",
  paymentIntentId: "pi_xxxxx",
  amountCharged: 1000.00,
  applicationFee: 150.00
}
```

**Requires Action Response:**
```typescript
{
  success: false,
  requiresAction: true,
  clientSecret: "pi_xxxxx_secret_xxxxx",
  message: "Payment requires additional authentication"
}
```

**Error Response:**
```typescript
{
  error: "Error message describing what went wrong"
}
```

## Database Schema Requirements

### Required Fields in `user_profiles` table:

```sql
-- Shipper fields
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS stripe_payment_method_id TEXT;

-- Carrier fields  
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;
```

### Required Fields in `loads` table:

```sql
ALTER TABLE loads ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;
```

### Required Fields in `bids` table:

```sql
ALTER TABLE bids ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;
```

## Environment Variables

Ensure these are set in your `.env.local`:

```env
STRIPE_SECRET_KEY=sk_test_xxxxx (or sk_live_xxxxx for production)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Implementation Details

### Payment Flow

1. **Authentication Check**: Verifies the logged-in user owns the load
2. **Bid Validation**: Confirms the bid exists and matches the load
3. **Shipper Payment Check**: Retrieves and validates shipper's Stripe customer ID and payment method
4. **Carrier Payout Check**: Retrieves and validates carrier's Stripe Connect account ID
5. **Payment Calculation**: 
   - Converts bid amount to cents
   - Calculates 15% application fee
6. **Payment Intent Creation**:
   - Charges shipper immediately (`confirm: true, off_session: true`)
   - Sets up destination transfer to carrier
   - Deducts application fee
7. **Database Updates**:
   - Updates load status to "assigned"
   - Marks winning bid as "accepted"
   - Marks other bids as "rejected"
   - Stores payment_intent_id for record keeping

### Commission Structure

```typescript
const applicationFeePercent = 0.15; // 15%
const applicationFee = Math.round(amountInCents * applicationFeePercent);
```

**Example:**
- Bid Amount: $1,000.00
- Hitchyard Fee: $150.00 (15%)
- Carrier Receives: $850.00 (85%)

## Next Steps - Additional Features Needed

### 1. Shipper Payment Method Setup
Create an action to allow shippers to add payment methods:

```typescript
// app/actions/stripe.ts
export async function setupShipperPaymentMethod() {
  // Create Stripe Customer
  // Attach payment method
  // Store in user_profiles
}
```

### 2. Payment Method Management UI
Add a page for shippers to:
- View saved payment methods
- Add new credit/debit cards
- Set default payment method
- Remove payment methods

### 3. Handle 3D Secure Authentication
Update the client-side to handle `requiresAction` response:

```typescript
if (result.requiresAction && result.clientSecret) {
  const { error } = await stripe.confirmCardPayment(result.clientSecret);
  // Handle confirmation result
}
```

### 4. Payment History & Receipts
- Display payment history in dashboard
- Generate receipts for completed transactions
- Show breakdown of fees

### 5. Refund Handling
Implement refund logic for cancelled loads:

```typescript
export async function refundPayment(paymentIntentId: string) {
  // Create refund through Stripe
  // Update database status
}
```

### 6. Webhook Handlers
Set up Stripe webhooks to handle:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `account.updated` (for carrier account status)
- `transfer.created`

## Testing

### Test Mode Setup

1. **Create Test Carrier Connect Account**:
   - Use Stripe Dashboard to create test connected account
   - Or use the existing `createConnectAccountLink` action

2. **Test Cards**:
   - Success: `4242 4242 4242 4242`
   - 3D Secure: `4000 0027 6000 3184`
   - Declined: `4000 0000 0000 0002`

3. **Test Flow**:
   ```bash
   # 1. Shipper adds payment method (needs to be implemented)
   # 2. Carrier sets up Connect account (existing feature)
   # 3. Carrier places bid
   # 4. Shipper accepts bid → triggers payment
   ```

## Security Considerations

- ✅ Payment methods stored in Stripe, not in database
- ✅ Server-side validation of load ownership
- ✅ Off-session payment with stored credentials
- ✅ Metadata tracking for audit trail
- ⚠️ Add rate limiting to prevent abuse
- ⚠️ Implement webhook signature verification
- ⚠️ Add payment confirmation emails

## Troubleshooting

### Common Errors

**"Shipper payment method not set up"**
- Shipper needs to add a payment method first
- Implement payment method setup flow

**"Carrier has not set up their payout account"**
- Carrier must complete Stripe Connect onboarding
- Use existing `PayoutSetupBanner` component

**"Payment processing failed: No such customer"**
- `stripe_customer_id` in database is invalid
- Recreate Stripe customer

**"This payment requires a source"**
- `stripe_payment_method_id` is missing or invalid
- User needs to re-add payment method

## Support

For Stripe-related issues:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Connect Docs](https://stripe.com/docs/connect)
- [Payment Intents API](https://stripe.com/docs/api/payment_intents)

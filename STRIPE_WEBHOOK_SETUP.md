# Stripe Webhook Setup Guide

This guide helps you configure and test Stripe webhooks locally for the HomeRent Payment module.

## Prerequisites

- Stripe CLI installed (`stripe --version` should work)
- Node.js and npm installed
- Backend running on `http://localhost:5000`

## Step 1: Get Your Stripe Webhook Signing Secret

### Option A: Generate Secret Locally (Recommended for Development)

```bash
stripe listen --forward-to localhost:5000/api/payments/webhook --print-secret
```

This command will output something like:
```
whsec_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

Copy this signing secret and save it.

### Option B: Get Secret from Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **Webhooks**
3. Click on your endpoint or create a new one
4. Endpoint URL: `http://localhost:5000/api/payments/webhook`
5. Events to send:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
6. Copy the signing secret (`whsec_...`)

## Step 2: Update .env File

```env
# In .env file
STRIPE_WEBHOOK_SECRET=whsec_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

Replace the placeholder with your actual signing secret from Step 1.

## Step 3: Start the Backend Server

```bash
npm run dev
```

Expected output:
```
[INFO] 01:32:38 ts-node-dev ver. 2.0.0
Server running on http://localhost:5000
```

## Step 4: Start Stripe CLI Webhook Listener

In a **separate terminal**, run:

```bash
# Option 1: Using npm script (recommended)
npm run stripe-webhook

# Option 2: Direct stripe CLI command
stripe listen --forward-to localhost:5000/api/payments/webhook
```

Expected output:
```
> stripe listen --forward-to localhost:5000/api/payments/webhook
Ready! You are now listening for Stripe webhooks. 
To view events in the dashboard, head over to https://dashboard.stripe.com/test/webhooks

Hanging out (^C to close)...
```

## Step 5: Test the Webhook

### Option A: Trigger Events via Stripe CLI

In a **third terminal**, trigger test events:

```bash
# Test successful payment
stripe trigger payment_intent.succeeded --add payment_intent:amount=5000

# Test failed payment
stripe trigger payment_intent.payment_failed --add payment_intent:amount=5000

# Test cancelled payment
stripe trigger payment_intent.canceled --add payment_intent:amount=5000
```

### Option B: Trigger Events via Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **Events**
3. Click on a webhook event → **Send to endpoint**
4. Select your webhook endpoint and test event

### Option C: Trigger via Payment Flow

1. Your frontend creates a payment intent
2. User completes payment in Stripe checkout
3. Stripe automatically sends webhook events

## Step 6: Verify Webhook Handling

Check your backend console for logs like:

```
Webhook processed: payment_intent.succeeded
Payment updated: payment_123 → SUCCESS
Booking confirmed: booking_456
```

## Webhook Events Handled

The Payment Service handles these Stripe webhook events:

| Event | What Happens |
|-------|--------------|
| `payment_intent.succeeded` | Payment marked SUCCESS, Booking marked CONFIRMED |
| `payment_intent.payment_failed` | Payment marked FAILED, Booking status reset to PENDING |
| `payment_intent.canceled` | Payment marked FAILED |

## Webhook Payload Structure

The webhook receives a Stripe `Event` object:

```json
{
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_1234567890",
      "status": "succeeded",
      "amount": 50000,
      "currency": "bdt",
      "metadata": {
        "bookingId": "booking_123",
        "userId": "user_456",
        "propertyId": "property_789"
      }
    }
  }
}
```

## Troubleshooting

### "Missing Stripe signature" error

**Problem:** Webhook endpoint says signature is missing.

**Solution:** Ensure `STRIPE_WEBHOOK_SECRET` is correctly set in `.env`:
```bash
enviroment variable: STRIPE_WEBHOOK_SECRET=whsec_...
```

### "Webhook signature verification failed" error

**Problem:** Signature doesn't match the secret.

**Solution:** 
1. Verify the signing secret matches exactly
2. Ensure no trailing spaces in `.env`
3. Restart the backend server after updating `.env`
4. Restart the `stripe listen` command

### "Payment not found" error

**Problem:** Webhook received but payment isn't in database.

**Solution:**
1. Ensure payment intent was created via `/api/payments/create-intent` endpoint
2. Check payment metadata includes correct `bookingId`
3. Verify the correct database is being used

### Webhook not being received

**Problem:** `stripe listen` is running but no events are received.

**Solution:**
1. Check `stripe listen` shows "Ready! You are now listening for Stripe webhooks"
2. Test with: `stripe trigger payment_intent.succeeded`
3. Verify the webhook URL is correct: `http://localhost:5000/api/payments/webhook`
4. Ensure firewall/antivirus isn't blocking localhost connections

## Terminal Setup (Recommended)

Keep 3 terminals open:

**Terminal 1: Backend Server**
```bash
npm run dev
```

**Terminal 2: Stripe Webhook Listener**
```bash
npm run stripe-webhook
# OR
stripe listen --forward-to localhost:5000/api/payments/webhook
```

**Terminal 3: Testing/Development**
```bash
# Use for Postman, stripe CLI tests, curl requests, etc.
stripe trigger payment_intent.succeeded
```

## Monitoring Webhooks

### Via Stripe CLI

The listener terminal shows every event with timestamp and result:
```
2024-03-27 10:15:22 payment_intent.succeeded [evt_1234567890] ➔ 200
```

### Via Backend Logs

Check your backend console for Processing logs:
```
Webhook received: payment_intent.succeeded
Processing webhook event...
Payment updated successfully
```

### Via Database

Query the Payment table to verify status updates:
```sql
SELECT id, status, stripePaymentIntentId, createdAt 
FROM payments 
ORDER BY createdAt DESC 
LIMIT 5;
```

## Advanced Topics

### Custom Webhook Events

To handle additional Stripe events, edit [payment.service.ts](src/modules/Payment/payment.service.ts):

```typescript
case "charge.refunded": {
  // Handle refund event
  break;
}
```

### Webhook Retries

Stripe retries failed webhooks with exponential backoff. Ensure your webhook endpoint:
- Returns HTTP 200 on success
- Is idempotent (handles duplicate events)
- Completes within 30 seconds

### IP Whitelisting

For production, whitelist Stripe's IP addresses. See [Stripe Docs](https://stripe.com/docs/ips).

## Testing Payment Flow

1. **Create Intent**
   ```
   POST /api/payments/create-intent
   Body: { "bookingId": "booking_123" }
   ```

2. **Confirm Payment** (simulates Stripe checkout completion)
   ```
   POST /api/payments/confirm
   Body: { "paymentIntentId": "pi_..." }
   ```

3. **Verify via Webhook** (automatic from Stripe)
   - Stripe sends `payment_intent.succeeded` event
   - Webhook updates Payment and Booking statuses

4. **Get Payment Status**
   ```
   GET /api/payments/:paymentId
   ```

## Environment Variables Checklist

- ✅ `STRIPE_SECRET_KEY` - Stripe Secret Key (starts with `sk_test_`)
- ✅ `STRIPE_WEBHOOK_SECRET` - Webhook Signing Secret (starts with `whsec_test_`)
- ✅ `STRIPE_PUBLISH_KEY` - Stripe Publishable Key (starts with `pk_test_`)
- ✅ `BETTER_AUTH_SECRET` - BetterAuth secret (min 32 chars)
- ✅ `DATABASE_URL` - PostgreSQL connection string
- ✅ `NODE_ENV` - Set to `development` for local testing

## Quick Start Commands

```bash
# 1. Install dependencies (if not already done)
npm install

# 2. Start backend
npm run dev

# 3. In another terminal, start webhook listener
npm run stripe-webhook

# 4. In third terminal, test webhook
stripe trigger payment_intent.succeeded
```

## Next Steps

- Create frontend payment form using Stripe Elements
- Implement payment confirmation flow
- Add email notifications for payment events
- Set up production webhook endpoint
- Configure additional Stripe events as needed

## Links

- [Stripe API Docs](https://stripe.com/docs/api)
- [Stripe Payments Guide](https://stripe.com/docs/payments)
- [Stripe CLI Docs](https://stripe.com/docs/stripe-cli)
- [Stripe Testing Cards](https://stripe.com/docs/testing)

## Support

For issues with Stripe webhooks:
1. Check this guide's Troubleshooting section
2. Verify all environment variables are correct
3. Check Stripe Dashboard → Developers → Webhook Events for error details
4. Review backend logs for validation errors

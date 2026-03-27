# Payment Module - Quick Reference

## Files Updated/Created

### 1. Fixed Files
- `src/app.ts` - Fixed duplicate webhook registration
- `.env` - Added `STRIPE_WEBHOOK_SECRET` configuration

### 2. New Documentation
- `STRIPE_WEBHOOK_SETUP.md` - Complete webhook setup guide
- `PAYMENT_TESTING_GUIDE.md` - API endpoint testing guide

## Payment Module Structure

```
src/modules/Payment/
├── payment.controller.ts     # Request handlers
├── payment.service.ts        # Business logic & Stripe integration
├── payment.route.ts          # API routes & webhook endpoint
├── payment.validation.ts     # Input validation schemas
├── payment.interface.ts      # TypeScript types
├── payment.constant.ts       # Messages, errors, defaults
└── index.ts                  # Exports
```

## Quick Start

### 1. Install Dependencies (if needed)
```bash
npm install
```

### 2. Configure Environment
```env
# In .env file, ensure these are set:
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISH_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...
```

Get webhook secret:
```bash
stripe listen --print-secret
```

### 3. Start Backend
```bash
npm run dev
```

### 4. Start Webhook Listener (New Terminal)
```bash
npm run stripe-webhook
# OR
stripe listen --forward-to localhost:5000/api/payments/webhook
```

### 5. Test Webhook (Third Terminal)
```bash
stripe trigger payment_intent.succeeded
```

## Key Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/payments/create-intent` | User | Create Stripe PaymentIntent |
| POST | `/api/payments/confirm` | User | Confirm payment after checkout |
| GET | `/api/payments/my-payments` | User | Get user's payments |
| GET | `/api/payments/:id` | User/Admin/Owner | Get payment by ID |
| GET | `/api/payments/booking/:bookingId` | User/Admin/Owner | Get payment by booking ID |
| GET | `/api/payments` | Admin | Get all payments |
| POST | `/api/payments/:id/refund` | Admin | Refund a payment |
| POST | `/api/payments/webhook` | Public | Stripe webhook receiver |

## Webhook Events Handled

- `payment_intent.succeeded` → Payment marked SUCCESS, Booking marked CONFIRMED
- `payment_intent.payment_failed` → Payment marked FAILED, Booking reverts to ACCEPTED
- `payment_intent.canceled` → Payment marked FAILED

## Database Models

### Payment Table
```sql
id                    -- String (UUID)
bookingId             -- String (FK to Booking)
userId                -- String (FK to User)
amount                -- Float
currency              -- String (default: BDT)
status                -- PaymentStatus (PENDING|SUCCESS|FAILED|REFUNDED)
stripePaymentIntentId -- String (unique, from Stripe)
receiptUrl            -- String (optional)
refundAmount          -- Float (optional)
refundedAt            -- DateTime (optional)
createdAt             -- DateTime
updatedAt             -- DateTime
```

## Payment Status Flow

```
Booking Created
       ↓
User initiates payment (create-intent)
       ↓ 
Payment status: PENDING
Booking status: PAYMENT_PENDING
       ↓
User completes Stripe checkout
       ↓
(Stripe webhook received)
       ↓
Payment status: SUCCESS or FAILED
Booking status: CONFIRMED or ACCEPTED (retry)
```

## Error Handling

All errors return standardized format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": {}  // Validation errors if applicable
}
```

Common errors:
- Missing `STRIPE_WEBHOOK_SECRET` → 500 error on webhook
- Invalid payment intent ID → 404 error
- Unauthorized access → 403 error
- Stripe connectivity issue → 402 error

## Webhook Signature Verification

The webhook endpoint verifies Stripe's signature using:
```typescript
const event = Stripe.webhooks.constructEvent(
  body,
  signature,
  webhookSecret
);
```

This requires:
1. `stripe-signature` header from Stripe
2. Raw request body (not parsed JSON)
3. Correct `STRIPE_WEBHOOK_SECRET`

## Testing

### Manual Testing
1. Create payment via API
2. Trigger webhook via `stripe trigger` command
3. Verify payment and booking status in database

### Postman Testing
See `PAYMENT_TESTING_GUIDE.md` for complete Postman collection and test cases

### Stripe Dashboard
1. Go to Dashboard → Developers → Events
2. Filter by webhook events
3. View delivery status and payload

## Troubleshooting

### Issue: "STRIPE_WEBHOOK_SECRET not configured" on webhook
**Solution:** Add `STRIPE_WEBHOOK_SECRET` to `.env` file

### Issue: "Webhook signature verification failed"
**Solution:** Ensure secret matches exactly, no trailing spaces

### Issue: Webhook received but payment not updated
**Solution:** Verify `bookingId` in payment metadata matches database

### Issue: Can't access webhook listener
**Solution:** Ensure `stripe listen` is running and shows "Ready!"

## Next Steps

1. ✅ Webhook setup complete
2. ✅ API endpoints ready
3. 📋 Create frontend payment form
4. 📧 Implement payment notifications
5. 🚀 Deploy to production with real webhook URL

## Documentation Links

- [Full Webhook Setup](STRIPE_WEBHOOK_SETUP.md)
- [API Testing Guide](PAYMENT_TESTING_GUIDE.md)
- [Stripe API Docs](https://stripe.com/docs/api)
- [Stripe CLI Docs](https://stripe.com/docs/stripe-cli)

## Environment Variables

```env
# Required for Stripe integration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISH_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...  # Get from: stripe listen --print-secret

# Required for backend
PORT=5000
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:5000
```

## Commands Summary

```bash
# Development
npm run dev                  # Start backend
npm run stripe-webhook      # Start webhook listener

# Testing
stripe trigger payment_intent.succeeded  # Trigger test event
npm run build               # Build for production
npm run lint                # Check code style
```

## Architecture

```
User (Frontend)
    ↓
[Create Intent] → Backend creates Stripe PaymentIntent
    ↓
[Stripe Checkout] → User completes payment
    ↓
Stripe → Webhook POST → /api/payments/webhook
    ↓
[Webhook Handler] → Updates Payment & Booking status
    ↓
[Frontend] polls Payment status OR uses Webhook confirmation
    ↓
[Confirm] → User confirms successful payment (optional)
```

## Support

For webhook issues:
1. Check that `stripe listen` is running
2. Verify `STRIPE_WEBHOOK_SECRET` is correct
3. Check Stripe Dashboard for event details
4. Review backend console logs
5. Check database for Payment records

---

**Payment Module v1.0 - Ready for Production!** 🎉

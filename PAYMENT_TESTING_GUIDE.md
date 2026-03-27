# Payment Module Testing Guide

Complete guide to test the Payment module endpoints for the HomeRent backend.

## Prerequisites

- Backend running: `npm run dev`
- Postman or curl installed
- Valid auth token from login endpoint
- A test booking ID in your database

## API Endpoints

### 1. Create Payment Intent

Creates a Stripe PaymentIntent for a booking.

**Endpoint:** `POST /api/payments/create-intent`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**
```json
{
  "bookingId": "booking_123abc"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Payment intent created successfully",
  "data": {
    "clientSecret": "pi_1234567890_secret_abcdef",
    "paymentIntentId": "pi_1234567890",
    "amount": 50000,
    "currency": "BDT",
    "bookingId": "booking_123abc"
  }
}
```

**Using curl:**
```bash
curl -X POST http://localhost:5000/api/payments/create-intent \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bookingId":"booking_123abc"}'
```

---

### 2. Confirm Payment

Confirms a payment after Stripe checkout is complete.

**Endpoint:** `POST /api/payments/confirm`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**
```json
{
  "paymentIntentId": "pi_1234567890"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Payment confirmed successfully",
  "data": {
    "id": "payment_456xyz",
    "bookingId": "booking_123abc",
    "userId": "user_789",
    "amount": 50000,
    "currency": "BDT",
    "status": "SUCCESS",
    "stripePaymentIntentId": "pi_1234567890",
    "receiptUrl": "receipt_generated",
    "createdAt": "2024-03-27T10:15:22.000Z",
    "confirmedAt": "2024-03-27T10:15:25.000Z"
  }
}
```

---

### 3. Get My Payments

Retrieve all payments for the authenticated user.

**Endpoint:** `GET /api/payments/my-payments`

**Query Parameters:**
```
page=1               (optional, default: 1)
pageSize=20          (optional, default: 20)
status=SUCCESS       (optional: PENDING, SUCCESS, FAILED, REFUNDED)
sortBy=createdAt     (optional: createdAt, amount, status)
sortOrder=desc       (optional: asc, desc)
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Example URL:**
```
http://localhost:5000/api/payments/my-payments?page=1&pageSize=10&status=SUCCESS&sortOrder=desc
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Your payments fetched successfully",
  "data": [
    {
      "id": "payment_1",
      "bookingId": "booking_1",
      "userId": "user_1",
      "amount": 50000,
      "currency": "BDT",
      "status": "SUCCESS",
      "stripePaymentIntentId": "pi_1234",
      "createdAt": "2024-03-27T10:15:22.000Z",
      "booking": {
        "id": "booking_1",
        "property": {
          "id": "property_1",
          "title": "Modern Flat in Dhaka"
        }
      }
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### 4. Get Payment by ID

Get details of a specific payment.

**Endpoint:** `GET /api/payments/:id`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Example URL:**
```
http://localhost:5000/api/payments/payment_456xyz
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Payment fetched successfully",
  "data": {
    "id": "payment_456xyz",
    "bookingId": "booking_123abc",
    "userId": "user_789",
    "amount": 50000,
    "currency": "BDT",
    "status": "SUCCESS",
    "stripePaymentIntentId": "pi_1234567890",
    "receiptUrl": "receipt_generated",
    "createdAt": "2024-03-27T10:15:22.000Z",
    "booking": {
      "id": "booking_123abc",
      "property": {
        "id": "property_1",
        "title": "Modern Flat in Dhaka",
        "rentAmount": 50000
      }
    },
    "user": {
      "id": "user_789",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

---

### 5. Get Payment by Booking ID

Get payment for a specific booking.

**Endpoint:** `GET /api/payments/booking/:bookingId`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Example URL:**
```
http://localhost:5000/api/payments/booking/booking_123abc
```

**Expected Response (200):**
Same as "Get Payment by ID"

---

### 6. Get All Payments (Admin Only)

Retrieve all payments in the system.

**Endpoint:** `GET /api/payments`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
```
page=1               (optional, default: 1)
pageSize=20          (optional, default: 20)
status=SUCCESS       (optional: PENDING, SUCCESS, FAILED, REFUNDED)
userId=user_123      (optional, filter by user)
sortBy=createdAt     (optional: createdAt, amount, status)
sortOrder=desc       (optional: asc, desc)
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "All payments fetched successfully",
  "data": [
    {
      "id": "payment_1",
      "bookingId": "booking_1",
      "userId": "user_1",
      "amount": 50000,
      "currency": "BDT",
      "status": "SUCCESS",
      "createdAt": "2024-03-27T10:15:22.000Z"
    },
    {
      "id": "payment_2",
      "bookingId": "booking_2",
      "userId": "user_2",
      "amount": 75000,
      "currency": "BDT",
      "status": "PENDING",
      "createdAt": "2024-03-27T10:20:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 2,
    "totalPages": 1
  }
}
```

---

### 7. Refund Payment (Admin Only)

Process a refund for a completed payment.

**Endpoint:** `POST /api/payments/:id/refund`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Body:**
```json
{
  "paymentId": "payment_456xyz",
  "refundAmount": 50000,
  "reason": "Customer requested cancellation"
}
```

**Note:** `refundAmount` is optional. If omitted, full amount is refunded.

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Payment refunded successfully",
  "data": {
    "id": "payment_456xyz",
    "bookingId": "booking_123abc",
    "userId": "user_789",
    "amount": 50000,
    "currency": "BDT",
    "status": "REFUNDED",
    "refundAmount": 50000,
    "refundedAt": "2024-03-27T10:30:00.000Z",
    "stripePaymentIntentId": "pi_1234567890"
  }
}
```

---

### 8. Stripe Webhook

Receives webhook events from Stripe.

**Endpoint:** `POST /api/payments/webhook`

**Headers:**
```
stripe-signature: <stripe_signature>
Content-Type: application/json
```

**This endpoint is called by Stripe automatically. No manual testing needed.**

To test locally:
```bash
npm run stripe-webhook
stripe trigger payment_intent.succeeded
```

---

## Testing Workflow

### Complete Payment Flow

1. **User logs in and gets token**
   ```bash
   # Login and save the access token
   TOKEN="your_access_token_here"
   BOOKING_ID="your_booking_id_here"
   ```

2. **Create Payment Intent**
   ```bash
   curl -X POST http://localhost:5000/api/payments/create-intent \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d "{\"bookingId\":\"$BOOKING_ID\"}"
   ```
   
   Save the `paymentIntentId` from response.

3. **Simulate Stripe Payment** (in another terminal)
   ```bash
   # Start webhook listener
   npm run stripe-webhook
   
   # In third terminal, trigger payment success
   stripe trigger payment_intent.succeeded --add payment_intent:id=pi_your_intent_id
   ```

4. **Confirm Payment**
   ```bash
   curl -X POST http://localhost:5000/api/payments/confirm \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d "{\"paymentIntentId\":\"pi_your_intent_id\"}"
   ```

5. **Check Payment Status**
   ```bash
   curl http://localhost:5000/api/payments/my-payments \
     -H "Authorization: Bearer $TOKEN"
   ```

---

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "fieldErrors": {
      "bookingId": ["Booking ID is required"]
    }
  }
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Payment not found"
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "message": "User ID not found"
}
```

### Forbidden (403)
```json
{
  "success": false,
  "message": "You do not have access to this payment"
}
```

### Stripe Error (400/402)
```json
{
  "success": false,
  "message": "Payment intent creation failed",
  "details": "Your card was declined"
}
```

---

## Test Cases

### Test Case 1: Successful Payment

**Steps:**
1. Create booking in database
2. Create payment intent → `PENDING`
3. Complete Stripe payment
4. Webhook updates → `SUCCESS`
5. Verify booking status → `CONFIRMED`

**Expected Outcome:** ✅ All CRUD operations work

### Test Case 2: Failed Payment

**Steps:**
1. Create payment intent
2. Payment fails in Stripe
3. Webhook updates → `FAILED`
4. Verify booking status remains → `ACCEPTED`
5. User can retry payment

**Expected Outcome:** ✅ Payment can be retried

### Test Case 3: Refund

**Steps:**
1. Complete successful payment
2. Admin initiates refund
3. Payment status → `REFUNDED`
4. Booking status → `CANCELLED`
5. User receives refund

**Expected Outcome:** ✅ Refund processed and booking cancelled

### Test Case 4: Authorization

**Steps:**
1. User A creates payment
2. User B tries to access User A's payment
3. Request should fail with 403

**Expected Outcome:** ✅ Access denied as expected

### Test Case 5: Admin Access

**Steps:**
1. Admin calls GET `/api/payments` without filters
2. Should return all payments from all users

**Expected Outcome:** ✅ Admin sees all payments

---

## Debugging Tips

### Check Payment Record
```sql
SELECT id, booking_id, status, stripe_payment_intent_id 
FROM payments 
WHERE booking_id = 'your_booking_id' 
LIMIT 1;
```

### Check Booking Status
```sql
SELECT id, status, confirmed_at 
FROM bookings 
WHERE id = 'your_booking_id' 
LIMIT 1;
```

### View Backend Logs
```bash
# Terminal running backend
# Look for log messages like:
# "Payment intent created successfully"
# "Webhook processed..."
# "Payment updated..."
```

### View Stripe Dashboard Events
1. Go to [Dashboard](https://dashboard.stripe.com/test/events)
2. Filter by `payment_intent.*` events
3. Check webhook delivery status

---

## Postman Collection

Import this as a Postman collection:

```json
{
  "info": {
    "name": "HomeRent Payment Module",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Create Payment Intent",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/api/payments/create-intent",
        "header": [
          {"key": "Authorization", "value": "Bearer {{token}}"}
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"bookingId\":\"{{bookingId}}\"}"
        }
      }
    }
  ]
}
```

---

## Performance Notes

- Payment list endpoints are paginated (20 items per page by default)
- Stripe API calls are made synchronously (consider async jobs for refunds)
- Webhook processing should complete within 30 seconds
- Database queries are indexed on userId and status

---

## Next Steps

1. ✅ Complete webhook setup: [STRIPE_WEBHOOK_SETUP.md](STRIPE_WEBHOOK_SETUP.md)
2. Implement frontend payment form
3. Add email notifications
4. Set up production webhook
5. Monitor payment metrics

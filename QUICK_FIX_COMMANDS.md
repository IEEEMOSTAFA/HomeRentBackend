# Quick Fix Commands - Payment Module

## 🚀 Fast Setup (Copy & Paste)

### 1. Install Dependencies
```bash
cd f:\nextlevel\HomeRent\HomeRentBackend
npm install stripe
npm install
```

### 2. Setup Stripe CLI
```bash
# Install (Windows with Chocolatey)
choco install stripe-cli

# Or download manually from:
# https://github.com/stripe/stripe-cli/releases

# Login to your Stripe account
stripe login

# Start webhook listener (keep this terminal running)
stripe listen --forward-to localhost:5000/api/payments/webhook
```

**Copy the output like:**
```
Ready! Your webhook signing secret is: whsec_test_xxxxxxxxxxxxx
```

### 3. Update .env File
Add this line to `.env` (use the actual secret from step 2):
```env
STRIPE_WEBHOOK_SECRET=whsec_test_xxxxxxxxxxxxx
```

Verify you have all Stripe keys:
```env
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_test_xxxxxxxxxxxxx
```

### 4. Start Backend
```bash
npm run dev
```

Server starts on: `http://localhost:5000`

---

## ✅ Verification Commands

### Check Stripe is Installed
```bash
npm list stripe
# Should show: stripe@15.0.0 (or newer)
```

### Check Environment Variables
```bash
# View all env vars
node -e "console.log(process.env.STRIPE_SECRET_KEY ? '✓ STRIPE_SECRET_KEY set' : '✗ Missing')"
node -e "console.log(process.env.STRIPE_WEBHOOK_SECRET ? '✓ STRIPE_WEBHOOK_SECRET set' : '✗ Missing')"
```

### Test Backend Health
```bash
# From another terminal
curl http://localhost:5000

# Should return: "HomeRent API is running"
```

### Test Stripe Connection
```javascript
// In Node.js terminal or create test.js
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20'
});

stripe.paymentIntents.list()
  .then(() => console.log('✓ Stripe connected'))
  .catch(e => console.log('✗ Error:', e.message));
```

---

## 🧪 Test Webhook Locally

### Terminal 1: Start Webhook Listener
```bash
stripe listen --forward-to localhost:5000/api/payments/webhook
```

Keep this running. Output shows:
```
Ready! Your webhook signing secret is: whsec_test_xxxxx
```

### Terminal 2: Trigger Test Event
```bash
stripe trigger payment_intent.succeeded
```

### Terminal 1 (Listener): Check for Success
```
2026-03-27 12:00:00   --> payment_intent.succeeded [evt_xxx]
2026-03-27 12:00:01   <--  [200] Request processed
```

---

## 🧪 Test Postman Endpoints

### 1. Create Payment Intent
```
POST http://localhost:5000/api/payments/create-intent
Header: Authorization: Bearer <YOUR_JWT_TOKEN>
Body: {
  "bookingId": "clv_xxxxx_yyyyy"
}
```

### 2. Confirm Payment
```
POST http://localhost:5000/api/payments/confirm
Header: Authorization: Bearer <YOUR_JWT_TOKEN>
Body: {
  "paymentIntentId": "pi_1234xxxxx",
  "bookingId": "clv_xxxxx_yyyyy"
}
```

### 3. Get My Payments
```
GET http://localhost:5000/api/payments/my-payments
Header: Authorization: Bearer <YOUR_JWT_TOKEN>
```

### 4. Get Payment by Booking
```
GET http://localhost:5000/api/payments/booking/clv_xxxxx_yyyyy
Header: Authorization: Bearer <YOUR_JWT_TOKEN>
```

---

## ❌ Fix Common Errors

### Error: "STRIPE_SECRET_KEY not configured"
```bash
# Check .env file has:
cat .env | grep STRIPE_SECRET_KEY

# Should show: STRIPE_SECRET_KEY=sk_test_xxxxx
# If not, add it manually
```

### Error: "Webhook secret not configured"
```bash
# Check webhook secret is set
cat .env | grep STRIPE_WEBHOOK_SECRET

# Should show: STRIPE_WEBHOOK_SECRET=whsec_test_xxxxx
# If not, run: stripe listen --print-secret
```

### Error: "stripe is not installed"
```bash
npm install stripe --save
npm install
```

### Error: "Stripe signature verification failed"
```bash
# 1. Verify secret matches
stripe listen --print-secret
# Compare with .env STRIPE_WEBHOOK_SECRET value

# 2. Restart backend
npm run dev

# 3. Test again
stripe trigger payment_intent.succeeded
```

### Error: "Cannot read property of undefined" or "stripeInstance is null"
```bash
# These should be FIXED by the code changes
# If still occurring:
# 1. Clear node_modules: rm -r node_modules
# 2. Reinstall: npm install
# 3. Restart: npm run dev
```

---

## 📝 Checklist Before Testing

- [ ] `npm install stripe` completed
- [ ] All Stripe keys in `.env`
- [ ] Backend running: `npm run dev`
- [ ] Stripe CLI logged in: `stripe login`
- [ ] Webhook listener running: `stripe listen --forward-to localhost:5000/api/payments/webhook`
- [ ] `.env` has `STRIPE_WEBHOOK_SECRET=whsec_test_...`
- [ ] Postman ready with JWT token
- [ ] Valid booking exists with status `ACCEPTED`

---

## 📚 Reference Documentation

| File | Purpose |
|------|---------|
| `PAYMENT_MODULE_ERRORS_SOLUTIONS.md` | Complete error analysis |
| `STRIPE_WEBHOOK_LOCAL_SETUP.md` | Detailed webhook setup |
| `PAYMENT_COMPLETE_TESTING_GUIDE.md` | All endpoints testing |
| `PAYMENT_MODULE_QUICKREF.md` | API reference |

---

## 🆘 Need Help?

### Check Logs
```bash
# Backend terminal shows all errors
# Look for: Error: xxx
# Or: TypeError: xxx
```

### Verify Changes Made
```bash
# Check if stripe package added
grep "stripe" package.json

# Check if .env updated
cat .env

# Restart everything:
npm run dev
```

### Still Stuck?
1. Read `PAYMENT_MODULE_ERRORS_SOLUTIONS.md` for detailed explanations
2. Follow `STRIPE_WEBHOOK_LOCAL_SETUP.md` step by step
3. Check `PAYMENT_COMPLETE_TESTING_GUIDE.md` for endpoint details


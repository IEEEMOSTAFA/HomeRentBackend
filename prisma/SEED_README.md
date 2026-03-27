# 🌱 Prisma Seed Script

## Overview
This seed script creates the initial **Admin user** for the HomeRent platform with bcrypt-hashed password security.

## Admin Credentials

| Field | Value |
|-------|-------|
| **Email** | muna@gmail.com |
| **Password** | muna1234 |
| **Role** | ADMIN |
| **Email Verified** | ✅ Yes |

## Usage

### Run the Seed Script

```bash
# Using npm script
npm run seed

# Or using Prisma directly
npx prisma db seed

# Or with ts-node
ts-node prisma/seed.ts
```

### Output Example
```
🌱 Starting database seed...
📝 Creating admin user: muna@gmail.com
✅ User created: <user-id>
✅ Account created with hashed password

╔════════════════════════════════════════╗
║    🎉 Seed Completed Successfully!     ║
╠════════════════════════════════════════╣
║ Email: muna@gmail.com
║ Password: muna1234
║ Role: ADMIN
║ Email Verified: ✓
╚════════════════════════════════════════╝
```

## How It Works

1. **Connection**: Connects to PostgreSQL database via PrismaClient
2. **Existence Check**: Queries for existing admin user by email
   - If found: Logs success message and exits (idempotent)
   - If not found: Proceeds to create
3. **Password Hashing**: Uses bcrypt with 10 salt rounds to hash the password
4. **User Creation**: Creates User record with:
   - role: "ADMIN"
   - emailVerified: true
   - isActive: true
   - isBanned: false
5. **Account Creation**: Creates Account record with:
   - providerId: "credentials"
   - accountId: "email"
   - password: bcrypt-hashed password

## Database Changes

### User Record Created
```sql
INSERT INTO users (id, name, email, email_verified, role, is_active, is_banned, created_at, updated_at)
VALUES (<cuid>, 'Admin Muna', 'muna@gmail.com', true, 'ADMIN', true, false, now(), now());
```

### Account Record Created
```sql
INSERT INTO accounts (id, account_id, provider_id, user_id, password, created_at, updated_at)
VALUES (<cuid>, 'email', 'credentials', <user-id>, <bcrypt-hash>, now(), now());
```

## Security Notes

- ✅ Password is hashed with bcrypt (NEVER stored in plaintext)
- ✅ Salt rounds: 10 (balances security with performance)
- ✅ Script is idempotent (safe to run multiple times)
- ✅ Can be modified to use environment variables for credentials

## Running After Database Reset

When you reset the database during development:

```bash
# Reset database (⚠️ CAUTION: Deletes all data)
npx prisma migrate reset

# Automatically runs seed script after migration
# No need to run manually
```

## Modifying Credentials

To change the admin credentials, edit `prisma/seed.ts`:

```typescript
const adminEmail = "your-email@example.com";  // Change email
const adminPassword = "your-password";         // Change password
const adminName = "Your Name";                 // Change name
```

Then run the seed script again.

## Troubleshooting

### Error: "Unique constraint failed on the fields: (`email`)"
The admin user already exists. The script will detect this and skip creation with idempotent behavior.

### Error: "DATABASE_URL not set"
Ensure `.env` file has:
```
DATABASE_URL="postgresql://user:password@localhost:5432/homerent"
```

### Error: "Cannot find module 'bcrypt'"
Install dependencies:
```bash
npm install
```

## File Location
- **Script**: `prisma/seed.ts`
- **Command**: Defined in `package.json` scripts
- **Prisma Config**: `package.json` → `prisma.seed` field

---

**LastUpdated**: March 28, 2026

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import bcrypt from "bcrypt";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = "muna@gmail.com";
  const adminPassword = "muna1234";
  const adminName = "Admin Muna";

  console.log("🌱 Starting database seed...");

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log(`✅ Admin user already exists: ${adminEmail}`);
      return;
    }

    // Hash password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    console.log(`📝 Creating admin user: ${adminEmail}`);

    // Create User
    const adminUser = await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        emailVerified: true,
        role: "ADMIN",
        isActive: true,
        isBanned: false,
      },
    });

    console.log(`✅ User created: ${adminUser.id}`);

    // Create Account with hashed password
    const adminAccount = await prisma.account.create({
      data: {
        accountId: "email",
        providerId: "credentials",
        userId: adminUser.id,
        password: hashedPassword,
      },
    });

    console.log(`✅ Account created with hashed password`);
    console.log(`
╔════════════════════════════════════════╗
║    🎉 Seed Completed Successfully!     ║
╠════════════════════════════════════════╣
║ Email: ${adminEmail}
║ Password: ${adminPassword}
║ Role: ADMIN
║ Email Verified: ✓
╚════════════════════════════════════════╝
    `);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();

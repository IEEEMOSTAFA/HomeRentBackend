

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from "nodemailer";

// ================= MAIL CONFIG =================
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.APP_USER,
    pass: process.env.APP_PASS,
  },
});

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  trustedOrigins: [process.env.APP_URL!],

  // ================= USER FIELDS =================
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "USER",
        required: false,
        input: true,
      },
      isActive: {
        type: "boolean",
        defaultValue: true,
        required: false,
      },
      isBanned: {
        type: "boolean",
        defaultValue: false,
        required: false,
      },
    },
  },

  // ================= AUTH METHOD =================
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: false,
  },

  // ================= EMAIL VERIFICATION =================
  emailVerification: {
    sendOnSignUp: true,
    // autoSignInAfterVerification: true,
    // sendVerificationEmail: async ({ user, url, token }) => {
    //   const verifyUrl = `${process.env.APP_URL}/verify-email?token=${token}`;

    //   await transporter.sendMail({
    //     from: `"Home Rent" <${process.env.APP_USER}>`,
    //     to: user.email,
    //     subject: "Verify your Home-Rent account",
    //     html: `
    //       <h2>Hello ${user.name}</h2>
    //       <p>Please verify your email to activate your account.</p>
    //       <a href="${verifyUrl}">Verify Email</a>
    //       <p>Click Here: ${url}</p>
    //     `,
    //   });
    // },


    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }) => {
      await transporter.sendMail({
        from: `"Home Rent" <${process.env.APP_USER}>`,
        to: user.email,
        subject: "Verify your Home-Rent account",
        html: `
      <h2>Hello ${user.name}</h2>
      <p>Please verify your email to activate your account.</p>
      <a href="${url}" style="...">Verify Email</a>
    `,
      });
    },
  },

  // ================= DATABASE HOOKS =================
  // Auto-create OwnerProfile immediately when OWNER registers
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            if (user.role === "OWNER") {
              const existing = await prisma.ownerProfile.findUnique({
                where: { userId: user.id },
              });

              if (!existing) {
                await prisma.ownerProfile.create({
                  data: {
                    userId: user.id,
                    phone: null,
                    nidNumber: null,
                    verified: false,
                    totalProperties: 0,
                    totalEarnings: 0,
                    rating: 0,
                    totalReviews: 0,
                  },
                });
                console.log("✅ OwnerProfile auto-created for:", user.email);
              }
            }
          } catch (err) {
            console.error("❌ OwnerProfile auto-create failed:", err);
          }
        },
      },
    },
  },

  advanced: {
    disableCSRFCheck: true, // dev only
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      accessType: "offline",
      prompt: "select_account consent",
    },
  },
});

































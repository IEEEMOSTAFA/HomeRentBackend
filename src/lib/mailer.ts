import nodemailer from "nodemailer";

// ================= SMTP TRANSPORTER =================
export const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT) || 587,
  secure: process.env.MAIL_SECURE === "true", // true for port 465, false for 587
  auth: {
    user: process.env.APP_USER,
    pass: process.env.APP_PASS,
  },
});

// ================= VERIFY CONNECTION ON STARTUP =================
transporter.verify((error) => {
  if (error) {
    console.error("❌ Mailer connection failed:", error);
  } else {
    console.log("✅ Mailer is ready to send emails");
  }
});
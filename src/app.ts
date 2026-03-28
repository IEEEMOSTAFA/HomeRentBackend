import express, { Application } from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import errorHandler from "./middlewares/globalErrorHandler";
import authExtraRoutes from "./routes/auth.extra";
import { OwnerRoutes } from "./modules/Owner/owner.route";
import { UserRoutes } from "./modules/User/user.route";
import { AdminRoutes } from "./modules/Admin/admin.route";
import { PaymentRoutes } from "./modules/Payment";
import { ImageRoutes } from "./modules/Image/image.routes";








const app: Application = express();

// ================= CORS =================
// app.use(
//   cors({
//     origin: process.env.APP_URL || true,
//     credentials: true,
//   })
// );







// Updated::

app.use(
  cors({
    origin: [
      
      "http://localhost:3000"
    ],
    credentials: true,
  })
);

// ================= BODY PARSER (AFTER WEBHOOK) =================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= AUTH ROUTES FIRST =================
app.use("/api/auth", authExtraRoutes);



// ================= BETTER-AUTH HANDLER =================
// Use regex pattern to match all /api/auth/* routes for better-auth
app.use("/api/auth", toNodeHandler(auth));

// ================= STRIPE WEBHOOK (BEFORE JSON PARSER) =================
// CRITICAL: Webhook must use raw body, register BEFORE express.json()
// The PaymentRoutes include raw body middleware internally
app.use("/api/payments", PaymentRoutes);



// ================= FEATURE ROUTES =================

app.use("/api/owner", OwnerRoutes);

app.use("/api/users", UserRoutes);
app.use("/api/admin", AdminRoutes);
app.use("/api/images", ImageRoutes);

// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.send("HomeRent API is running ");
});

// ================= ERROR HANDLER =================
app.use(errorHandler);

export default app;

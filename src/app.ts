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
import { PropertyRoutes } from "./modules/Property/property.route";
import { BookingRoutes } from "./modules/Booking/booking.route";
import { ReviewRoutes } from "./modules/Review/review.route";
import { NotificationRoutes } from "./modules/Notification/notification.route";
import { BlogRoutes } from "./modules/Blog/blog.route";








const app: Application = express();









// Updated::

// app.use(
//   cors({
//     origin: [
      
//       "http://localhost:3000"
//     ],
//     credentials: true,
//   })
// );


app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      process.env.APP_URL || ""     // ✅ Vercel URL
      
    ].filter(Boolean),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type", 
      "Authorization", 
      "Cookie",
      "Origin",
      "Accept",
    ],
  })
);

// ================= BODY PARSER (AFTER WEBHOOK) =================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));




// /api/auth/me, /api/auth/update-role, /api/auth/verify-otp, /api/auth/resend-otp
// app.use("/api/auth", authExtraRoutes);
// ================= AUTH ROUTES FIRST =================
app.use("/api/auth", authExtraRoutes);



// ================= BETTER-AUTH HANDLER =================
// Use regex pattern to match all /api/auth/* routes for better-auth
app.use("/api/auth", toNodeHandler(auth));
// app.use("/api/auth", otpRoutes);
// ================= STRIPE WEBHOOK (BEFORE JSON PARSER) =================
// CRITICAL: Webhook must use raw body, register BEFORE express.json()
// The PaymentRoutes include raw body middleware internally
app.use("/api/payments", PaymentRoutes);



// ================= FEATURE ROUTES =================
app.use("/api/properties", PropertyRoutes);
app.use("/api/owner", OwnerRoutes);

app.use("/api/users", UserRoutes);
app.use("/api/admin", AdminRoutes);
app.use("/api/images", ImageRoutes);
app.use("/api/bookings", BookingRoutes);
app.use("/api/reviews", ReviewRoutes); 
app.use("/api/notifications", NotificationRoutes); // Add this line
app.use("/api/blog", BlogRoutes);
// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.send("HomeRent API is running ");
});

// ================= ERROR HANDLER =================
app.use(errorHandler);

export default app;

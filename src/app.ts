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

// import authExtraRoutes from "./routes/auth.extra";

// import { categoryRouter } from "./modules/category/category.router";
// import { tutorRouter } from "./modules/tutor/tutor.router";
// import { bookingRouter } from "./modules/booking/booking.router";
// import { reviewRouter } from "./modules/review/review.router";
// import { adminRouter } from "./modules/admin/admin.router";
// import { studentRouter } from "./modules/student/student.router";







const app: Application = express();

// ================= CORS =================
// app.use(
//   cors({
//     origin: process.env.APP_URL || true,
//     credentials: true,
//   })
// );







// Updated::

// app.use(
//   cors({
//     origin: [
//       "https://edtech-frontend-flax.vercel.app",
//       "http://localhost:3000"
//     ],
//     credentials: true,
//   })
// );



// ================= AUTH ROUTES FIRST =================
app.use("/api/auth", authExtraRoutes);

// ================= STRIPE WEBHOOK (BEFORE JSON PARSER) =================
// Webhook must use raw body, so it's registered before express.json()
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  PaymentRoutes
);

// ================= BETTER-AUTH HANDLER =================
// Use regex pattern to match all /api/auth/* routes for better-auth
app.use("/api/auth", toNodeHandler(auth));

// ================= BODY PARSER AFTER AUTH =================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= FEATURE ROUTES =================
// app.use("/api/admin", adminRouter);
// app.use("/api/tutors", tutorRouter);
// app.use("/api/bookings", bookingRouter);
// app.use("/api/reviews", reviewRouter);
// app.use("/api/categories", categoryRouter);
// app.use("/api/dashboard", studentRouter);
app.use("/api/owner", OwnerRoutes);
app.use("/api/users", UserRoutes);
app.use("/api/admin", AdminRoutes);
app.use("/api/payments", PaymentRoutes);

// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.send("HomeRent API is running ");
});

// ================= ERROR HANDLER =================
app.use(errorHandler);

export default app;










































































// import express, { Application, Request, Response } from 'express';
// import cors from 'cors';

// const app: Application = express();

// // parsers
// app.use(express.json());
// app.use(cors());

// // application routes
// // app.use('/api/v1', router);

// app.get('/', (req: Request, res: Response) => {
//   res.send('Hello from Apollo Gears World!');
// });

// export default app;

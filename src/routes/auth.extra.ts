import { Router, Request, Response } from "express";
import auth from "../middlewares/auth";
import { prisma } from "../lib/prisma";
import { auth as betterAuth } from "../lib/auth";

const authExtraRoutes = Router();

// ================= GET CURRENT USER =================
authExtraRoutes.get("/me", auth(), async (req: Request, res: Response) => {
  try {
    console.log("📍 /api/auth/me ROUTE HIT", req.user);

    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        image: true,
        isActive: true,
        isBanned: true,
        createdAt: true,
        updatedAt: true,
        ownerProfile: req.user?.role === "OWNER" ? true : false,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    console.error("❌ Get user error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
});

// ================= UPDATE ROLE =================
authExtraRoutes.patch("/update-role", async (req: Request, res: Response) => {
  try {
    console.log("📍 /api/auth/update-role ROUTE HIT");

    const session = await betterAuth.api.getSession({
      headers: req.headers as any,
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No active session",
      });
    }

    const { role } = req.body;

    if (!role || !["USER", "OWNER"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be USER or OWNER",
      });
    }

    console.log(`🔄 Updating user ${session.user.id} role to ${role}`);

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
      },
    });

    if (role === "OWNER") {
      const existingProfile = await prisma.ownerProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (!existingProfile) {
        console.log("🆕 Creating OwnerProfile for:", session.user.id);
        await prisma.ownerProfile.create({
          data: {
            userId: session.user.id,
            phone: null,
            nidNumber: null,
            verified: false,
            totalProperties: 0,
            totalEarnings: 0,
            rating: 0,
            totalReviews: 0,
          },
        });
        console.log("✅ OwnerProfile created");
      } else {
        console.log("ℹ️ OwnerProfile already exists");
      }
    }

    return res.status(200).json({
      success: true,
      message: "Role updated successfully",
      data: updatedUser,
    });
  } catch (error: any) {
    console.error("❌ Update role error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
});

// ================= VERIFY OTP =================
authExtraRoutes.post("/verify-otp", async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        otp: true,
        otpExpiry: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    if (!user.otp) {
      return res.status(400).json({
        success: false,
        message: "No OTP found. Please request a new one",
      });
    }

    // ✅ Cast to Date to resolve 'never' type before prisma client regenerates
    const otpExpiry = user.otpExpiry as Date | null;
    if (otpExpiry && new Date() > otpExpiry) {
      await prisma.user.update({
        where: { email },
        data: { otp: null, otpExpiry: null },
      });
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    await prisma.user.update({
      where: { email },
      data: {
        emailVerified: true,
        otp: null,
        otpExpiry: null,
      },
    });

    console.log("✅ Email verified for:", email);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error: any) {
    console.error("❌ Verify OTP error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
});

// ================= RESEND OTP =================
authExtraRoutes.post("/resend-otp", async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, emailVerified: true },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    await betterAuth.api.sendVerificationEmail({
      body: { email, callbackURL: "/" },
    });

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully. Please check your email",
    });
  } catch (error: any) {
    console.error("❌ Resend OTP error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
});

export default authExtraRoutes;

























// import { Router, Request, Response } from "express";
// import auth from "../middlewares/auth";
// import { prisma } from "../lib/prisma";
// import { betterAuth } from "better-auth/*";
// import { auth as betterAuth } from "../lib/auth";

// const authExtraRoutes = Router();

// // ================= EXISTING ROUTE - Get Current User =================
// authExtraRoutes.get("/me", auth(), async (req: Request, res: Response) => {
//   try {
//     console.log(" /api/auth/me ROUTE HIT", req.user);

//     const user = await prisma.user.findUnique({
//       where: { id: req.user?.id },
//       select: {
//         id: true,
//         email: true,
//         name: true,
//         role: true,
//         emailVerified: true,
//         image: true,
//         isActive: true,
//         isBanned: true,
//         createdAt: true,
//         updatedAt: true,
//         ownerProfile: req.user?.role === "OWNER" ? true : false,
//       },
//     });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: user,
//     });
//   } catch (error: any) {
//     console.error("❌ Get user error:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message || "Internal server error",
//     });
//   }
// });

// // ================= NEW ROUTE - UPDATE ROLE =================
// authExtraRoutes.patch("/update-role", async (req: Request, res: Response) => {
//   try {
//     console.log(" /api/auth/update-role ROUTE HIT");
//     console.log(" Request body:", req.body);
//     console.log(" Request headers:", req.headers.cookie);

//     const session = await betterAuth.api.getSession({
//       headers: req.headers as any,
//     });

//     console.log("👤 Session:", session);

//     if (!session) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized - No active session",
//       });
//     }

//     const { role } = req.body;

//     if (!role || !["USER", "OWNER"].includes(role)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid role. Must be USER or OWNER",
//       });
//     }

//     console.log(` Updating user ${session.user.id} role to ${role}`);

//     const updatedUser = await prisma.user.update({
//       where: { id: session.user.id },
//       data: { role },
//       select: {
//         id: true,
//         email: true,
//         name: true,
//         role: true,
//         emailVerified: true,
//       },
//     });

//     console.log("✅ User updated:", updatedUser);

//     if (role === "OWNER") {
//       const existingProfile = await prisma.ownerProfile.findUnique({
//         where: { userId: session.user.id },
//       });

//       if (!existingProfile) {
//         console.log("🆕 Creating OwnerProfile for user:", session.user.id);

//         await prisma.ownerProfile.create({
//           data: {
//             userId: session.user.id,
//             phone: null,
//             nidNumber: null,
//             verified: false,
//             totalProperties: 0,
//             totalEarnings: 0,
//             rating: 0,
//             totalReviews: 0,
//           },
//         });

//         console.log("✅ OwnerProfile created");
//       } else {
//         console.log("ℹ️ OwnerProfile already exists");
//       }
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Role updated successfully",
//       data: updatedUser,
//     });
//   } catch (error: any) {
//     console.error("❌ Update role error:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message || "Internal server error",
//     });
//   }
// });

// // ================= NEW ROUTE - VERIFY OTP =================
// authExtraRoutes.post("/verify-otp", async (req: Request, res: Response) => {
//   const { email, otp } = req.body;
//   try {
//     const user = await prisma.user.findUnique({ where: { email } });

//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     // if (user.otp !== otp) {
//     //   return res.status(400).json({ success: false, message: "Invalid OTP" });
//     // }

//     await prisma.user.update({
//       where: { email },
//       data: { emailVerified: true, otp: null },
//     });

//     return res.status(200).json({ success: true, message: "Email verified successfully" });
//   } catch (error: any) {
//     console.error("❌ Verify OTP error:", error);
//     return res.status(500).json({ success: false, message: "Internal server error" });
//   }
// });

// export default authExtraRoutes;











// // Testedd:



// import { Router, Request, Response } from "express";
// import auth from "../middlewares/auth";
// import { prisma } from "../lib/prisma";
// import { auth as betterAuth } from "../lib/auth"; //  Import better-auth
// // import { prisma } from "../lib/prisma"; //  Import prisma

// const authExtraRoutes = Router();

// // ================= EXISTING ROUTE - Get Current User =================
// authExtraRoutes.get("/me", auth(), async (req: Request, res: Response) => {
//   try {
//     console.log(" /api/auth/me ROUTE HIT", req.user);

//     // Fetch full user data including profile if OWNER
//     const user = await prisma.user.findUnique({
//       where: { id: req.user?.id },
//       select: {
//         id: true,
//         email: true,
//         name: true,
//         role: true,
//         emailVerified: true,
//         image: true,
//         isActive: true,
//         isBanned: true,
//         createdAt: true,
//         updatedAt: true,
//         ownerProfile: req.user?.role === "OWNER" ? true : false,
//       },
//     });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: user,
//     });
//   } catch (error: any) {
//     console.error("❌ Get user error:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message || "Internal server error",
//     });
//   }
// });

// // =================  NEW ROUTE - UPDATE ROLE =================
// authExtraRoutes.patch("/update-role", async (req: Request, res: Response) => {
//   try {
//     console.log(" /api/auth/update-role ROUTE HIT");
//     console.log(" Request body:", req.body);
//     console.log(" Request headers:", req.headers.cookie);

//     // Get session from better-auth
//     const session = await betterAuth.api.getSession({
//       headers: req.headers as any,
//     });

//     console.log("👤 Session:", session);

//     if (!session) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized - No active session",
//       });
//     }

//     const { role } = req.body;

//     // Validate role - USER and OWNER can be set by user. ADMIN is system-only.
//     if (!role || !["USER", "OWNER"].includes(role)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid role. Must be USER or OWNER",
//       });
//     }

//     console.log(` Updating user ${session.user.id} role to ${role}`);

//     // Update user role in database
//     const updatedUser = await prisma.user.update({
//       where: { id: session.user.id },
//       data: { role },
//       select: {
//         id: true,
//         email: true,
//         name: true,
//         role: true,
//         emailVerified: true,
//       },
//     });

//     console.log("✅ User updated:", updatedUser);

//     // If changing to OWNER, create OwnerProfile
//     if (role === "OWNER") {
//       const existingProfile = await prisma.ownerProfile.findUnique({
//         where: { userId: session.user.id },
//       });

//       if (!existingProfile) {
//         console.log("🆕 Creating OwnerProfile for user:", session.user.id);
        
//         await prisma.ownerProfile.create({
//           data: {
//             userId: session.user.id,
//             phone: null,
//             nidNumber: null,
//             verified: false,
//             totalProperties: 0,
//             totalEarnings: 0,
//             rating: 0,
//             totalReviews: 0,
//           },
//         });

//         console.log("✅ OwnerProfile created");
//       } else {
//         console.log("ℹ️ OwnerProfile already exists");
//       }
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Role updated successfully",
//       data: updatedUser,
//     });
//   } catch (error: any) {
//     console.error("❌ Update role error:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message || "Internal server error",
//     });
//   }
// });

// export default authExtraRoutes;





















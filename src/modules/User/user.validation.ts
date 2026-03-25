import { z } from "zod";

// ================= SIGNUP VALIDATION =================
export const signupValidationSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  email: z
    .string()
    .email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(50, "Password must be less than 50 characters")
    .regex(/[A-Z]/, "Password must contain uppercase letter")
    .regex(/[0-9]/, "Password must contain a number"),
});

// ================= LOGIN VALIDATION =================
export const loginValidationSchema = z.object({
  email: z
    .string()
    .email("Invalid email format"),
  password: z
    .string()
    .min(1, "Password is required"),
});

// ================= UPDATE ROLE VALIDATION =================
export const updateRoleValidationSchema = z.object({
  role: z
    .enum(["USER", "OWNER"])
    .refine((val) => ["USER", "OWNER"].includes(val), {
      message: "Role must be USER or OWNER",
    }),
});

// ================= UPDATE PROFILE VALIDATION =================
export const updateProfileValidationSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .optional(),
  image: z
    .string()
    .url("Image must be a valid URL")
    .optional()
    .nullable(),
  phone: z
    .string()
    .regex(/^[0-9+\-\s\(\)]{10,}$/, "Invalid phone number")
    .optional()
    .nullable(),
  nidNumber: z
    .string()
    .min(10, "NID number must be at least 10 characters")
    .optional()
    .nullable(),
});

// ================= INFER TYPES =================
export type SignupInput = z.infer<typeof signupValidationSchema>;
export type LoginInput = z.infer<typeof loginValidationSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleValidationSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileValidationSchema>;
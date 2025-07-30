import { z } from "zod";

export const signupSchema = z.object({
  body: z
    .object({
      username: z.string().min(3, "Username must be at least 3 characters"),
      email: z.string().email("Invalid email address"),
      password: z.string().min(8, "Password must be at least 8 characters"),
      passwordConfirm: z.string().min(8),
    })
    .refine((data) => data.password === data.passwordConfirm, {
      message: "Passwords do not match",
      path: ["passwordConfirm"],
    }),
});

export const signinSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string(),
  }),
});

export const updateMeSchema = z.object({
  body: z.object({
    username: z.string().min(3).optional(),
    email: z.string().email().optional(),
  }),
});

export const updatePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z.string().min(8),
      newPassword: z.string().min(8),
      newPasswordConfirm: z.string().min(8),
    })
    .refine((data) => data.newPassword === data.newPasswordConfirm, {
      message: "Passwords do not match",
      path: ["newPasswordConfirm"],
    }),
});

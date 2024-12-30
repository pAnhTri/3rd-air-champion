import { z } from "zod";

export const registerZodObject = z.object({
  email: z
    .string()
    .email({ message: "Invalid email address" })
    .nonempty({ message: "Email required" }),
  name: z
    .string()
    .min(3, "Must be at least 3 characters long")
    .regex(/^[^!@#$%^&*()_+=[\]{};:"\\|,<>/?~]+$/, {
      message: "Name cannot contain a special character",
    }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(64, { message: "Password must be no more than 64 characters long" })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter",
    })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[`!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/, {
      message: "Password must contain at least one special character",
    })
    .regex(/^\S*$/, { message: "Password must not contain spaces" }),
});

export type registerZodSchema = z.infer<typeof registerZodObject>;

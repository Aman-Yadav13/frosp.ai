import { Language, Stack } from "@/types";
import * as z from "zod";

export const LoginSchema = z.object({
  username: z.string().min(1, {
    message: "Username is required!",
  }),
  email: z.string().email({
    message: "Email is required!",
  }),
  password: z.string().min(1, {
    message: "Password is required!",
  }),
});

export const RegisterSchema = z.object({
  email: z.string().email({
    message: "Email is required!",
  }),
  password: z.string().min(6, {
    message: "Password must be atleast 6 characters",
  }),
  username: z.string().min(1, {
    message: "Username is required!",
  }),
  fullName: z.string().min(1, {
    message: "Full name is required!",
  }),
});

export const resetPasswordSchema = z.object({
  oldPassword: z.string().min(1, {
    message: "Old password is required!",
  }),
  newPassword: z.string().min(1, {
    message: "New password is required!",
  }),
});

export const changeAccountDetailsSchema = z.object({
  fullName: z.string().min(1, {
    message: "Full name is required!",
  }),
  email: z.string().email({
    message: "Email is required!",
  }),
});

export const createProjectSchema = z.object({
  pname: z
    .string()
    .min(1, {
      message: "Project name is required!",
    })
    .refine((value) => value !== undefined, {
      message: "Project name is required!",
    }),
  planguage: z.nativeEnum(Language).refine((value) => value !== undefined, {
    message: "Project language is required!",
  }),
  pstack: z.nativeEnum(Stack).optional(),
});

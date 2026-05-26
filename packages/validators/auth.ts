import { z } from "zod";

import { usernameModel } from "./user";

export const createUserWithEmailAndPasswordInputModel = z.object({
  username: usernameModel,
  fullName: z.string().min(1).max(80).describe("The full name of the user"),
  email: z.email().describe("The email of the user"),
  password: z.string().min(8).max(100).describe("The password of the user"),
});

export type CreateUserWithEmailAndPasswordInput = z.infer<
  typeof createUserWithEmailAndPasswordInputModel
>;

export const createUserWithEmailAndPasswordOutputModel = z.object({
  id: z.uuid().describe("The id of the user created"),
  email: z.email().describe("The email pending verification"),
  requiresVerification: z.literal(true).describe("User must verify email before login"),
});

export type CreateUserWithEmailAndPasswordOutput = z.infer<
  typeof createUserWithEmailAndPasswordOutputModel
>;

export const verifyEmailWithOtpInputModel = z.object({
  email: z.email().describe("The email to verify"),
  code: z
    .string()
    .length(6)
    .regex(/^\d{6}$/)
    .describe("Six-digit verification code"),
});

export type VerifyEmailWithOtpInput = z.infer<typeof verifyEmailWithOtpInputModel>;

export const verifyEmailWithOtpOutputModel = z.object({
  id: z.uuid().describe("The id of the verified user"),
  token: z.string().describe("The JWT token of the user"),
});

export type VerifyEmailWithOtpOutput = z.infer<typeof verifyEmailWithOtpOutputModel>;

export const resendEmailVerificationOtpInputModel = z.object({
  email: z.email().describe("The email to resend verification to"),
});

export type ResendEmailVerificationOtpInput = z.infer<
  typeof resendEmailVerificationOtpInputModel
>;

export const resendEmailVerificationOtpOutputModel = z.object({
  success: z.boolean().describe("Whether the OTP was queued for delivery"),
});

export type ResendEmailVerificationOtpOutput = z.infer<
  typeof resendEmailVerificationOtpOutputModel
>;

export const signInUserWithEmailAndPasswordInputModel = z.object({
  email: z.email().describe("The email of the user"),
  password: z.string().min(8).max(100).describe("The password of the user"),
});

export type SignInUserWithEmailAndPasswordInput = z.infer<
  typeof signInUserWithEmailAndPasswordInputModel
>;

export const signInUserWithEmailAndPasswordOutputModel = z.object({
  id: z.uuid().describe("The id of the signed in user"),
  token: z.string().describe("The JWT token of the user"),
});

export type SignInUserWithEmailAndPasswordOutput = z.infer<
  typeof signInUserWithEmailAndPasswordOutputModel
>;

export const generateJWTTokenInputModel = z.object({
  id: z.uuid().describe("The id of the user"),
});

export type GenerateJWTTokenInput = z.infer<typeof generateJWTTokenInputModel>;

export const getLoggedInUserInfoInputModel = z.undefined();

export const getLoggedInUserInfoOutputModel = z.object({
  id: z.uuid().describe("Id of User"),
  username: usernameModel.describe("Public username"),
  email: z.email().describe("Email of User"),
  fullName: z.string().describe("Full name of user"),
  profileImageUrl: z
    .string()
    .describe("Profile image user of user")
    .optional()
    .nullable(),
  emailNotificationsEnabled: z
    .boolean()
    .describe("Whether the creator receives email alerts for new form responses"),
});

export type GetLoggedInUserInfoOutput = z.infer<typeof getLoggedInUserInfoOutputModel>;

export const updateEmailNotificationsInputModel = z.object({
  enabled: z.boolean().describe("Enable or disable creator response notification emails"),
});

export type UpdateEmailNotificationsInput = z.infer<typeof updateEmailNotificationsInputModel>;

export const updateEmailNotificationsOutputModel = z.object({
  emailNotificationsEnabled: z.boolean(),
});

export type UpdateEmailNotificationsOutput = z.infer<typeof updateEmailNotificationsOutputModel>;

/** tRPC mutations with no args still send `{}` over HTTP — do not use `z.undefined()` here */
export const signOutInputModel = z.object({});

export const signOutOutputModel = z.object({
  success: z.boolean().describe("Whether sign out succeeded"),
});

export type SignOutOutput = z.infer<typeof signOutOutputModel>;

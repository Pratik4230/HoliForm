import { z } from "zod";

export const createUserWithEmailAndPasswordInputModel = z.object({
  fullName: z.string().min(1).max(80).describe("The full name of the user"),
  email: z.email().describe("The email of the user"),
  password: z.string().min(8).max(100).describe("The password of the user"),
});

export type CreateUserWithEmailAndPasswordInput = z.infer<
  typeof createUserWithEmailAndPasswordInputModel
>;

export const createUserWithEmailAndPasswordOutputModel = z.object({
  id: z.uuid().describe("The id of the user created"),
  token: z.string().describe("The JWT token of the user"),
});

export type CreateUserWithEmailAndPasswordOutput = z.infer<
  typeof createUserWithEmailAndPasswordOutputModel
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
  email: z.email().describe("Email of User"),
  fullName: z.string().describe("Full name of user"),
  profileImageUrl: z
    .string()
    .describe("Profile image user of user")
    .optional()
    .nullable(),
});

export type GetLoggedInUserInfoOutput = z.infer<typeof getLoggedInUserInfoOutputModel>;

export const signOutInputModel = z.undefined();

export const signOutOutputModel = z.object({
  success: z.boolean().describe("Whether sign out succeeded"),
});

export type SignOutOutput = z.infer<typeof signOutOutputModel>;

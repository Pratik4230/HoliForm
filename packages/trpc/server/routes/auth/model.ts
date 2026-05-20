import { z } from "zod";

export const createUserWithEmailAndPasswordInputModel = z.object({
  fullName: z.string().min(1).max(80).describe("The full name of the user"),
  email: z.email().describe("The email of the user"),
  password: z.string().min(8).max(100).describe("The password of the user"),
});

export const createUserWithEmailAndPasswordOutputModel = z.object({
  id: z.string().describe("The id of the user created"),
  token: z.string().describe("The JWT token of the user"),
});

export const signInUserWithEmailAndPasswordInputModel = z.object({
  email: z.email().describe("The email of the user"),
  password: z.string().min(8).max(100).describe("The password of the user"),
});

export const signInUserWithEmailAndPasswordOutputModel = z.object({
  id: z.string().describe("The id of the signed in user"),
  token: z.string().describe("The JWT token of the user"),
});

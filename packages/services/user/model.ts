import { z } from "zod";

export const createUserWithEmailAndPasswordInput = z.object({
  fullName: z.string().describe("The full name of the user"),
  email: z.email().describe("The email of the user"),
  password: z.string().min(8).describe("The password of the user"),
});

export type CreateUserWithEmailAndPasswordInput = z.infer<
  typeof createUserWithEmailAndPasswordInput
>;

export const generateJWTTokenInput = z.object({
  id: z.string().describe("The id of the user"),
});

export type GenerateJWTTokenInput = z.infer<typeof generateJWTTokenInput>;

import { API_ERROR_CODES } from "@repo/validators/api-errors";
import { AppServiceError } from "@repo/services/errors";

import { publicProcedure, protectedProcedure, router } from "../../trpc";
import {
  clearAutheticationCookie,
  setAutheticationCookie,
} from "../../utils/cookie";
import { mapServiceError } from "../../utils/map-service-error";
import { protectedOpenApiMeta, publicOpenApiMeta } from "../../utils/openapi-meta";
import { generatePath } from "../../utils/path-generator";
import { userService } from "../../services";
import {
  createUserWithEmailAndPasswordInputModel,
  createUserWithEmailAndPasswordOutputModel,
  getLoggedInUserInfoInputModel,
  getLoggedInUserInfoOutputModel,
  signInUserWithEmailAndPasswordInputModel,
  signInUserWithEmailAndPasswordOutputModel,
  signOutInputModel,
  signOutOutputModel,
} from "@repo/validators/auth";

const TAGS = ["Authentication"];
const getPath = generatePath("/authentication");

function mapAuthServiceError(error: unknown): never {
  if (error instanceof Error) {
    if (
      error.message === "User with this email already exists" ||
      error.message === "Username is already taken"
    ) {
      mapServiceError(new AppServiceError(error.message, API_ERROR_CODES.AUTH_CONFLICT));
    }

    if (error.message === "Invalid email or password") {
      mapServiceError(
        new AppServiceError(error.message, API_ERROR_CODES.AUTH_INVALID_CREDENTIALS),
      );
    }
  }

  mapServiceError(error);
}

export const authRouter = router({
  createUserWithEmailAndPasswordInput: publicProcedure
    .meta(publicOpenApiMeta("POST", getPath("/createUserWithEmailAndPasswordInput"), TAGS))
    .input(createUserWithEmailAndPasswordInputModel)
    .output(createUserWithEmailAndPasswordOutputModel)
    .mutation(async ({ input, ctx }) => {
      try {
        const { id, token } = await userService.createUserWithEmailAndPassword(input);
        setAutheticationCookie(ctx, token);
        return { id, token };
      } catch (error) {
        mapAuthServiceError(error);
      }
    }),

  signInUserWithEmailAndPassword: publicProcedure
    .meta(publicOpenApiMeta("POST", getPath("/signInUserWithEmailAndPassword"), TAGS))
    .input(signInUserWithEmailAndPasswordInputModel)
    .output(signInUserWithEmailAndPasswordOutputModel)
    .mutation(async ({ input, ctx }) => {
      try {
        const { email, password } = input;
        const { id, token } = await userService.signInUserWithEmailAndPassword({
          email,
          password,
        });
        setAutheticationCookie(ctx, token);
        return { id, token };
      } catch (error) {
        mapAuthServiceError(error);
      }
    }),

  getLoggedInUserInfo: protectedProcedure
    .meta(protectedOpenApiMeta("GET", getPath("/getLoggedInUserInfo"), TAGS))
    .input(getLoggedInUserInfoInputModel)
    .output(getLoggedInUserInfoOutputModel)
    .query(async ({ ctx }) => {
      const { id, username, email, fullName, profileImageUrl } = ctx.user;
      return { id, username, email, fullName, profileImageUrl };
    }),

  signOut: publicProcedure
    .meta(publicOpenApiMeta("POST", getPath("/signOut"), TAGS))
    .input(signOutInputModel)
    .output(signOutOutputModel)
    .mutation(async ({ ctx }) => {
      clearAutheticationCookie(ctx);
      return { success: true };
    }),
});

import { publicProcedure, protectedProcedure, router } from "../../trpc";
import {
  clearAutheticationCookie,
  setAutheticationCookie,
} from "../../utils/cookie";
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
} from "./model";

const TAGS = ["Authentication"];
const getPath = generatePath("/authentication");

export const authRouter = router({
  createUserWithEmailAndPasswordInput: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/createUserWithEmailAndPasswordInput"),
        tags: TAGS,
      },
    })
    .input(createUserWithEmailAndPasswordInputModel)
    .output(createUserWithEmailAndPasswordOutputModel)
    .mutation(async ({ input, ctx }) => {
      const { fullName, email, password } = input;
      const { id, token } = await userService.createUserWithEmailAndPassword({
        fullName,
        email,
        password,
      });

      setAutheticationCookie(ctx, token);

      return { id, token };
    }),

  signInUserWithEmailAndPassword: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/signInUserWithEmailAndPassword"),
        tags: TAGS,
      },
    })
    .input(signInUserWithEmailAndPasswordInputModel)
    .output(signInUserWithEmailAndPasswordOutputModel)
    .mutation(async ({ input, ctx }) => {
      const { email, password } = input;

      const { id, token } = await userService.signInUserWithEmailAndPassword({
        email,
        password,
      });

      setAutheticationCookie(ctx, token);

      return { id, token };
    }),

  getLoggedInUserInfo: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getLoggedInUserInfo"),
        tags: TAGS,
      },
    })
    .input(getLoggedInUserInfoInputModel)
    .output(getLoggedInUserInfoOutputModel)
    .query(async ({ ctx }) => {
      const { id, email, fullName, profileImageUrl } = ctx.user;
      return { id, email, fullName, profileImageUrl };
    }),

  signOut: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/signOut"),
        tags: TAGS,
      },
    })
    .input(signOutInputModel)
    .output(signOutOutputModel)
    .mutation(async ({ ctx }) => {
      clearAutheticationCookie(ctx);
      return { success: true };
    }),
});

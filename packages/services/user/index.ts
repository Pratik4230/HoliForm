import { randomBytes, createHmac } from "crypto";
import * as JWT from "jsonwebtoken";
import { db, eq } from "@repo/database";
import { usersTable } from "@repo/database/models/user";
import { inngest, INNGEST_EVENTS } from "@repo/inngest";
import {
  createUserWithEmailAndPasswordInputModel,
  generateJWTTokenInputModel,
  type CreateUserWithEmailAndPasswordInput,
  type GenerateJWTTokenInput,
  resendEmailVerificationOtpInputModel,
  type ResendEmailVerificationOtpInput,
  type UpdateEmailNotificationsInput,
  updateEmailNotificationsInputModel,
  signInUserWithEmailAndPasswordInputModel,
  type SignInUserWithEmailAndPasswordInput,
  verifyEmailWithOtpInputModel,
  type VerifyEmailWithOtpInput,
} from "@repo/validators/auth";
import { API_ERROR_CODES } from "@repo/validators/api-errors";

import { AppServiceError } from "../errors";
import { env } from "../env";
import {
  generateOtpCode,
  storeEmailVerificationOtp,
  verifyEmailVerificationOtp,
} from "./otp";

class UserService {
  private async getUserByEmail(email: string) {
    const user = await db.select().from(usersTable).where(eq(usersTable.email, email));
    return user.length > 0 ? user[0] : null;
  }

  private async getUserByUsername(username: string) {
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username));
    return user.length > 0 ? user[0] : null;
  }

  private async generateJWTToken(payload: GenerateJWTTokenInput) {
    const { id } = await generateJWTTokenInputModel.parseAsync(payload);
    const token = JWT.sign({ id }, env.JWT_SECRET);
    return { token };
  }

  private async verifyUserToken(token: string): Promise<GenerateJWTTokenInput> {
    try {
      const verificationResult = JWT.verify(token, env.JWT_SECRET) as GenerateJWTTokenInput;
      return verificationResult;
    } catch (error) {
      throw new Error("Invalid token");
    }
  }

  private async getUserInfoById(id: string) {
    const user = await db
      .select({
        id: usersTable.id,
        username: usersTable.username,
        email: usersTable.email,
        fullName: usersTable.fullName,
        profileImageUrl: usersTable.profileImageUrl,
        emailNotificationsEnabled: usersTable.emailNotificationsEnabled,
      })
      .from(usersTable)
      .where(eq(usersTable.id, id));

    if (!user || user.length === 0) throw new Error(`user with ID ${id} does not exists`);
    const userRecord = user[0];
    if (!userRecord) throw new Error(`user with ID ${id} does not exists`);

    return userRecord;
  }

  private async queueVerificationOtp(params: {
    userId: string;
    email: string;
    fullName: string;
  }) {
    const code = generateOtpCode();
    await storeEmailVerificationOtp(params.userId, code);
    await inngest.send({
      name: INNGEST_EVENTS.SEND_VERIFICATION_OTP,
      data: {
        email: params.email,
        fullName: params.fullName,
        code,
      },
    });
  }

  public async createUserWithEmailAndPassword(payload: CreateUserWithEmailAndPasswordInput) {
    const { username, fullName, email, password } =
      await createUserWithEmailAndPasswordInputModel.parseAsync(payload);

    const isUserExists = await this.getUserByEmail(email);
    if (isUserExists) {
      throw new Error("User with this email already exists");
    }

    const isUsernameTaken = await this.getUserByUsername(username);
    if (isUsernameTaken) {
      throw new Error("Username is already taken");
    }

    const salt = randomBytes(16).toString("hex");
    const hash = await this.generateHash(salt, password);
    const userInsertResult = await db
      .insert(usersTable)
      .values({
        username,
        email,
        fullName,
        password: hash,
        salt,
        emailVerified: false,
      })
      .returning({
        id: usersTable.id,
      });

    if (userInsertResult.length === 0 || !userInsertResult[0]) {
      throw new Error("Failed to create user");
    }

    const userId = userInsertResult[0].id;

    await this.queueVerificationOtp({ userId, email, fullName });

    return {
      id: userId,
      email,
      requiresVerification: true as const,
    };
  }

  public async verifyEmailWithOtp(payload: VerifyEmailWithOtpInput) {
    const { email, code } = await verifyEmailWithOtpInputModel.parseAsync(payload);
    const result = await verifyEmailVerificationOtp(email, code);

    if (!result.ok) {
      if (result.reason === "already_verified") {
        const { token } = await this.generateJWTToken({ id: result.userId });
        return { id: result.userId, token };
      }
      throw new AppServiceError(
        "Invalid or expired verification code",
        API_ERROR_CODES.AUTH_OTP_INVALID,
      );
    }

    const { token } = await this.generateJWTToken({ id: result.userId });
    return { id: result.userId, token };
  }

  public async updateEmailNotifications(userId: string, payload: UpdateEmailNotificationsInput) {
    const { enabled } = await updateEmailNotificationsInputModel.parseAsync(payload);

    const updated = await db
      .update(usersTable)
      .set({ emailNotificationsEnabled: enabled })
      .where(eq(usersTable.id, userId))
      .returning({ emailNotificationsEnabled: usersTable.emailNotificationsEnabled });

    const row = updated[0];
    if (!row) {
      throw new Error(`user with ID ${userId} does not exists`);
    }

    return { emailNotificationsEnabled: row.emailNotificationsEnabled };
  }

  public async resendEmailVerificationOtp(payload: ResendEmailVerificationOtpInput) {
    const { email } = await resendEmailVerificationOtpInputModel.parseAsync(payload);
    const user = await this.getUserByEmail(email);

    if (!user) {
      return { success: true };
    }

    if (user.emailVerified) {
      return { success: true };
    }

    await this.queueVerificationOtp({
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
    });

    return { success: true };
  }

  public async signInUserWithEmailAndPassword(payload: SignInUserWithEmailAndPasswordInput) {
    const { email, password } =
      await signInUserWithEmailAndPasswordInputModel.parseAsync(payload);

    const existingUser = await this.getUserByEmail(email);
    if (!existingUser) {
      throw new Error("User with this email does not exist");
    }

    if (!existingUser.emailVerified) {
      throw new AppServiceError(
        "Please verify your email before signing in",
        API_ERROR_CODES.AUTH_EMAIL_NOT_VERIFIED,
      );
    }

    if (!existingUser.password || !existingUser.salt) {
      throw new Error("Invalid Authentication method");
    }

    const hash = await this.generateHash(existingUser.salt, password);

    if (hash !== existingUser.password) {
      throw new Error("Invalid email or password");
    }

    const token = await this.generateJWTToken({ id: existingUser.id });

    return {
      id: existingUser.id,
      token: token.token,
    };
  }

  private async generateHash(salt: string, password: string) {
    return createHmac("sha256", salt).update(password).digest("hex");
  }

  public async verifyAndDecodeToken(token: string) {
    const { id } = await this.verifyUserToken(token);
    const userInfo = await this.getUserInfoById(id);

    return { ...userInfo };
  }
}

export default UserService;

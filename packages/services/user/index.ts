import { randomBytes, createHmac } from "crypto";
import * as JWT from "jsonwebtoken";
import { db, eq } from "@repo/database";
import { usersTable } from "@repo/database/models/user";
import {
  createUserWithEmailAndPasswordInput,
  generateJWTTokenInput,
  GenerateJWTTokenInput,
  signInUserWithEmailAndPasswordInput,
  SignInUserWithEmailAndPasswordInputType,
  type CreateUserWithEmailAndPasswordInput,
} from "./model";
import { env } from "../env";

class UserService {
  private async getUserByEmail(email: string) {
    const user = await db.select().from(usersTable).where(eq(usersTable.email, email));
    return user.length > 0 ? user[0] : null;
  }

  private async generateJWTToken(payload: GenerateJWTTokenInput) {
    const { id } = await generateJWTTokenInput.parseAsync(payload);
    const token = JWT.sign({ id }, env.JWT_SECRET);
    return { token };
  }

  private async generateHash(salt: string, password: string) {
    return createHmac("sha256", salt).update(password).digest("hex");
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
        email: usersTable.email,
        fullName: usersTable.fullName,
        profileImageUrl: usersTable.profileImageUrl,
      })
      .from(usersTable)
      .where(eq(usersTable.id, id));

    if (!user || user.length === 0) throw new Error(`user with ID ${id} does not exists`);
    const userRecord = user[0];
    if (!userRecord) throw new Error(`user with ID ${id} does not exists`);

    return userRecord;
  }
  public async createUserWithEmailAndPassword(payload: CreateUserWithEmailAndPasswordInput) {
    const { fullName, email, password } =
      await createUserWithEmailAndPasswordInput.parseAsync(payload);

    // check is user exists by email
    const isUserExists = await this.getUserByEmail(email);
    if (isUserExists) {
      throw new Error("User with this email already exists");
    }

    const salt = randomBytes(16).toString("hex");
    const hash = await this.generateHash(salt, password);
    const userInsertResult = await db
      .insert(usersTable)
      .values({ email, fullName, password: hash, salt })
      .returning({
        id: usersTable.id,
      });

    if (userInsertResult.length === 0 || !userInsertResult || !userInsertResult[0]) {
      throw new Error("Failed to create user");
    }

    const userId = userInsertResult[0].id;

    // generate jwt token
    const { token } = await this.generateJWTToken({ id: userId });

    return {
      id: userId,
      token,
    };
  }

  public async signInUserWithEmailAndPassword(payload: SignInUserWithEmailAndPasswordInputType) {
    const { email, password } = await signInUserWithEmailAndPasswordInput.parseAsync(payload);

    const existingUser = await this.getUserByEmail(email);
    if (!existingUser) {
      throw new Error("User with this email does not exist");
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

  public async verifyAndDecodeToken(token: string) {
    const { id } = await this.verifyUserToken(token);
    const userInfo = await this.getUserInfoById(id);

    return { ...userInfo };
  }
}

export default UserService;

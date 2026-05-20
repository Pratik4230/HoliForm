import { randomBytes, createHmac } from "crypto";
import * as JWT from "jsonwebtoken";
import { db, eq } from "@repo/database";
import { usersTable } from "@repo/database/models/user";
import {
  createUserWithEmailAndPasswordInput,
  generateJWTTokenInput,
  GenerateJWTTokenInput,
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

  public async createUserWithEmailAndPassword(payload: CreateUserWithEmailAndPasswordInput) {
    const { fullName, email, password } =
      await createUserWithEmailAndPasswordInput.parseAsync(payload);

    // check is user exists by email
    const isUserExists = await this.getUserByEmail(email);
    if (isUserExists) {
      throw new Error("User with this email already exists");
    }

    const salt = randomBytes(16).toString("hex");
    const hash = createHmac("sha256", salt).update(password).digest("hex");
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
}

export default UserService;

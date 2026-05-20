import { randomBytes, createHmac } from "crypto";
import { db, eq } from "@repo/database";
import { usersTable } from "@repo/database/models/user";
import {
  createUserWithEmailAndPasswordInput,
  type CreateUserWithEmailAndPasswordInput,
} from "./model";

class UserService {
  private async getUserByEmail(email: string) {
    const user = await db.select().from(usersTable).where(eq(usersTable.email, email));
    return user.length > 0 ? user[0] : null;
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

    return {
      id: userInsertResult[0]?.id,
    };
  }
}

export default UserService;

import { createHmac, randomInt } from "node:crypto";

import { and, db, eq, gt } from "@repo/database";
import { emailVerificationOtpsTable } from "@repo/database/models/emailVerificationOtp";
import { usersTable } from "@repo/database/models/user";

import { env } from "../env";

const OTP_TTL_MS = 10 * 60 * 1000;

export function generateOtpCode(): string {
  return String(randomInt(100_000, 1_000_000));
}

export function hashOtpCode(code: string): string {
  return createHmac("sha256", env.JWT_SECRET).update(code).digest("hex");
}

export async function storeEmailVerificationOtp(userId: string, code: string) {
  const codeHash = hashOtpCode(code);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await db.delete(emailVerificationOtpsTable).where(eq(emailVerificationOtpsTable.userId, userId));

  await db.insert(emailVerificationOtpsTable).values({
    userId,
    codeHash,
    expiresAt,
  });
}

export async function verifyEmailVerificationOtp(email: string, code: string) {
  const userRows = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  const user = userRows[0];
  if (!user) {
    return { ok: false as const, reason: "user_not_found" as const };
  }

  if (user.emailVerified) {
    return { ok: false as const, reason: "already_verified" as const, userId: user.id };
  }

  const otpRows = await db
    .select()
    .from(emailVerificationOtpsTable)
    .where(
      and(
        eq(emailVerificationOtpsTable.userId, user.id),
        gt(emailVerificationOtpsTable.expiresAt, new Date()),
      ),
    )
    .limit(1);

  const otp = otpRows[0];
  if (!otp) {
    return { ok: false as const, reason: "invalid_or_expired" as const };
  }

  const codeHash = hashOtpCode(code);
  if (codeHash !== otp.codeHash) {
    return { ok: false as const, reason: "invalid_or_expired" as const };
  }

  await db
    .update(usersTable)
    .set({ emailVerified: true })
    .where(eq(usersTable.id, user.id));

  await db.delete(emailVerificationOtpsTable).where(eq(emailVerificationOtpsTable.userId, user.id));

  return { ok: true as const, userId: user.id };
}

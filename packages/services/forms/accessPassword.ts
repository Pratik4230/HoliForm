import { createHmac, randomBytes } from "node:crypto";

export function hashFormAccessPassword(password: string, salt: string) {
  return createHmac("sha256", salt).update(password).digest("hex");
}

export function createFormAccessPasswordCredentials(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = hashFormAccessPassword(password, salt);
  return { salt, hash };
}

export function verifyFormAccessPassword(
  password: string,
  salt: string | null | undefined,
  hash: string | null | undefined,
) {
  if (!salt || !hash) {
    return false;
  }
  return hashFormAccessPassword(password, salt) === hash;
}

export function formRequiresPassword(
  salt: string | null | undefined,
  hash: string | null | undefined,
) {
  return Boolean(salt && hash);
}

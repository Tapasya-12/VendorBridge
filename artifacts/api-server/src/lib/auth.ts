import crypto from "crypto";

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "vendorbridge_salt").digest("hex");
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export function generateToken(userId: number): string {
  return crypto.createHash("sha256").update(`${userId}_${Date.now()}_vendorbridge`).digest("hex");
}

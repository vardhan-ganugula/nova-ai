import crypto from "crypto";
import { SOCIAL_TOKEN_ENCRYPTION_KEY } from "./config.util.js";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96 bits for GCM

/**
 * Derives a consistent 32-byte (256-bit) encryption key from the configured secret.
 */
function getEncryptionKey(): Buffer {
  return crypto.createHash("sha256").update(SOCIAL_TOKEN_ENCRYPTION_KEY).digest();
}

/**
 * Encrypts sensitive credentials (like Meta/Instagram access tokens) using AES-256-GCM.
 * Output format: iv_hex:auth_tag_hex:ciphertext_hex
 */
export function encryptSocialToken(plainText: string): string {
  if (!plainText) return "";

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

/**
 * Decrypts an AES-256-GCM encrypted token string.
 * Validates integrity via the auth tag before returning the plain text.
 */
export function decryptSocialToken(cipherPayload: string): string {
  if (!cipherPayload) return "";

  const parts = cipherPayload.split(":");
  if (parts.length !== 3) {
    // If not in encrypted format (e.g. legacy plain text token in development), handle safely
    return cipherPayload;
  }

  const [ivHex, authTagHex, encryptedHex] = parts;

  try {
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const encryptedText = Buffer.from(encryptedHex, "hex");

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encryptedText),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  } catch (err: any) {
    console.error("[Token Decryption Error]:", err?.message || "Failed to decrypt token");
    throw new Error("Unable to decrypt social token. Authentication credential may be corrupted or key mismatch.");
  }
}

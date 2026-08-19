import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

function getKey(): Buffer {
  const raw = process.env.WALLET_ENCRYPTION_KEY;

  if (!raw) {
    throw new Error(
      "WALLET_ENCRYPTION_KEY is not configured",
    );
  }

  const key = Buffer.from(raw, "base64");

  if (key.length !== 32) {
    throw new Error(
      "WALLET_ENCRYPTION_KEY must be a base64 encoded 32-byte key",
    );
  }

  return key;
}

export function encryptSecret(
  value: string,
): string {
  const key = getKey();

  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv(
    ALGORITHM,
    key,
    iv,
  );

  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);

  const authTag =
    cipher.getAuthTag();

  return [
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64"),
  ].join(".");
}

export function decryptSecret(
  payload: string,
): string {
  const key = getKey();

  const parts = payload.split(".");

  if (parts.length !== 3) {
    throw new Error(
      "Invalid encrypted secret",
    );
  }

  const iv = Buffer.from(
    parts[0],
    "base64",
  );

  const authTag = Buffer.from(
    parts[1],
    "base64",
  );

  const encrypted = Buffer.from(
    parts[2],
    "base64",
  );

  const decipher =
    crypto.createDecipheriv(
      ALGORITHM,
      key,
      iv,
    );

  decipher.setAuthTag(authTag);

  const decrypted =
    Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

  return decrypted.toString("utf8");
}

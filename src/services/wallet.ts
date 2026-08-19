import crypto from "crypto";
import { config } from "../config";
import { Wallet } from "../types";

const wallets = new Map<number, Wallet>();

function getEncryptionKey(): Buffer {
  if (!config.security.encryptionKey) {
    throw new Error(
      "WALLET_ENCRYPTION_KEY is not configured",
    );
  }

  return crypto
    .createHash("sha256")
    .update(config.security.encryptionKey)
    .digest();
}

export function encryptPrivateKey(
  privateKey: string,
): string {
  const key = getEncryptionKey();

  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    key,
    iv,
  );

  const encrypted = Buffer.concat([
    cipher.update(privateKey, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return [
    iv.toString("hex"),
    tag.toString("hex"),
    encrypted.toString("hex"),
  ].join(":");
}

export function decryptPrivateKey(
  encrypted: string,
): string {
  const key = getEncryptionKey();

  const [
    ivHex,
    tagHex,
    encryptedHex,
  ] = encrypted.split(":");

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(ivHex, "hex"),
  );

  decipher.setAuthTag(
    Buffer.from(tagHex, "hex"),
  );

  const decrypted = Buffer.concat([
    decipher.update(
      Buffer.from(encryptedHex, "hex"),
    ),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

export async function createWallet(
  userId: number,
) {
  /*
   * Replace with real ethers wallet generation.
   */

  const privateKey =
    "GENERATE_REAL_PRIVATE_KEY_HERE";

  const address =
    "GENERATE_REAL_ADDRESS_HERE";

  const wallet: Wallet = {
    userId,
    address,
    encryptedPrivateKey:
      encryptPrivateKey(privateKey),
  };

  wallets.set(userId, wallet);

  return wallet;
}

export function getWallet(
  userId: number,
): Wallet | undefined {
  return wallets.get(userId);
}

export async function getBalance(
  userId: number,
): Promise<string> {
  const wallet = getWallet(userId);

  if (!wallet) return "0";

  /*
   * Connect to Robinhood RPC here.
   */

  return "0";
}

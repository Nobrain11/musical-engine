import {
  Wallet as EthersWallet,
  getAddress,
} from "ethers";

import crypto from "crypto";

import { config } from "../config";
import { Wallet } from "../types";
import { provider } from "./rpc";

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

  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    key,
    iv,
  );

  const encrypted = Buffer.concat([
    cipher.update(privateKey, "utf8"),
    cipher.final(),
  ]);

  const authTag =
    cipher.getAuthTag();

  return [
    iv.toString("hex"),
    authTag.toString("hex"),
    encrypted.toString("hex"),
  ].join(":");
}

export function decryptPrivateKey(
  encrypted: string,
): string {
  const key = getEncryptionKey();

  const parts = encrypted.split(":");

  if (parts.length !== 3) {
    throw new Error(
      "Invalid encrypted wallet format",
    );
  }

  const [
    ivHex,
    authTagHex,
    encryptedHex,
  ] = parts;

  const decipher =
    crypto.createDecipheriv(
      "aes-256-gcm",
      key,
      Buffer.from(ivHex, "hex"),
    );

  decipher.setAuthTag(
    Buffer.from(
      authTagHex,
      "hex",
    ),
  );

  const decrypted =
    Buffer.concat([
      decipher.update(
        Buffer.from(
          encryptedHex,
          "hex",
        ),
      ),
      decipher.final(),
    ]);

  return decrypted.toString("utf8");
}

/*
|--------------------------------------------------------------------------
| CREATE WALLET
|--------------------------------------------------------------------------
*/

export async function createWallet(
  userId: number,
): Promise<Wallet> {
  const existing =
    wallets.get(userId);

  if (existing) {
    return existing;
  }

  const wallet =
    EthersWallet.createRandom();

  const encryptedPrivateKey =
    encryptPrivateKey(
      wallet.privateKey,
    );

  const storedWallet: Wallet = {
    userId,

    address: getAddress(
      wallet.address,
    ),

    encryptedPrivateKey,
  };

  wallets.set(
    userId,
    storedWallet,
  );

  return storedWallet;
}

/*
|--------------------------------------------------------------------------
| IMPORT WALLET
|--------------------------------------------------------------------------
*/

export async function importWallet(
  userId: number,
  privateKey: string,
): Promise<Wallet> {
  const wallet =
    new EthersWallet(
      privateKey,
    );

  const encryptedPrivateKey =
    encryptPrivateKey(
      wallet.privateKey,
    );

  const storedWallet: Wallet = {
    userId,

    address: getAddress(
      wallet.address,
    ),

    encryptedPrivateKey,
  };

  wallets.set(
    userId,
    storedWallet,
  );

  return storedWallet;
}

/*
|--------------------------------------------------------------------------
| GET WALLET
|--------------------------------------------------------------------------
*/

export function getWallet(
  userId: number,
): Wallet | undefined {
  return wallets.get(userId);
}

/*
|--------------------------------------------------------------------------
| GET SIGNER
|--------------------------------------------------------------------------
*/

export function getSigner(
  userId: number,
): EthersWallet {
  const wallet =
    wallets.get(userId);

  if (!wallet) {
    throw new Error(
      "Trading wallet not found",
    );
  }

  const privateKey =
    decryptPrivateKey(
      wallet.encryptedPrivateKey,
    );

  return new EthersWallet(
    privateKey,
    provider,
  );
}

/*
|--------------------------------------------------------------------------
| BALANCE
|--------------------------------------------------------------------------
*/

export async function getBalance(
  userId: number,
): Promise<string> {
  const wallet =
    wallets.get(userId);

  if (!wallet) {
    return "0";
  }

  const balance =
    await provider.getBalance(
      wallet.address,
    );

  const { formatEther } =
    await import("ethers");

  return formatEther(balance);
}

/*
|--------------------------------------------------------------------------
| RAW BALANCE
|--------------------------------------------------------------------------
*/

export async function getRawBalance(
  userId: number,
): Promise<bigint> {
  const wallet =
    wallets.get(userId);

  if (!wallet) {
    return 0n;
  }

  return provider.getBalance(
    wallet.address,
  );
}

/*
|--------------------------------------------------------------------------
| CONNECTIVITY CHECK
|--------------------------------------------------------------------------
*/

export async function checkWalletConnection(
  userId: number,
): Promise<boolean> {
  try {
    const wallet =
      wallets.get(userId);

    if (!wallet) {
      return false;
    }

    await provider.getBalance(
      wallet.address,
    );

    return true;
  } catch {
    return false;
  }
}

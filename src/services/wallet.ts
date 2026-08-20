// src/services/wallet.ts

import {
  HDNodeWallet,
  Wallet,
  getAddress,
  isAddress,
} from "ethers";

import {
  CreatedWallet,
  StoredWallet,
  WalletCredentials,
} from "../types";

import {
  addWallet,
  createWalletId,
  getActiveWallet,
  getWallet as getStoredWallet,
  getWallets,
  removeWallet,
  setActiveWallet,
  walletNameExists,
} from "./walletStore";

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function normalizeName(
  name: string,
): string {
  const value = String(name ?? "").trim();

  if (!value) {
    throw new Error(
      "Wallet name is required",
    );
  }

  if (value.length > 32) {
    throw new Error(
      "Wallet name cannot exceed 32 characters",
    );
  }

  return value;
}

function uniqueName(
  userId: number,
  name: string,
): string {
  const normalized = normalizeName(name);

  if (
    walletNameExists(
      userId,
      normalized,
    )
  ) {
    throw new Error(
      "A wallet with this name already exists",
    );
  }

  return normalized;
}

function normalizePrivateKey(
  privateKey: string,
): string {
  const key = String(privateKey ?? "").trim();

  if (
    !/^0x[0-9a-fA-F]{64}$/.test(key)
  ) {
    throw new Error(
      "Invalid private key",
    );
  }

  return key;
}

function normalizeAddress(
  address: string,
): string {
  if (!isAddress(address)) {
    throw new Error(
      "Invalid wallet address",
    );
  }

  return getAddress(address);
}

function makeStoredWallet(
  userId: number,
  name: string,
  address: string,
  privateKey: string,
  mnemonic: string | undefined,
  source:
    | "GENERATED"
    | "PRIVATE_KEY"
    | "SEED_PHRASE",
): StoredWallet {
  const now = Date.now();

  return {
    id: createWalletId(),

    userId,

    name,

    address: normalizeAddress(address),

    encryptedPrivateKey: privateKey,

    encryptedMnemonic: mnemonic ?? null,

    source,

    createdAt: now,
    updatedAt: now,
  };
}

/*
|--------------------------------------------------------------------------
| Generate Wallet
|--------------------------------------------------------------------------
*/

export function createWallet(
  userId: number,
  name = "Main",
): CreatedWallet {
  const walletName = uniqueName(
    userId,
    name,
  );

  const wallet =
    HDNodeWallet.createRandom();

  const privateKey =
    wallet.privateKey;

  const mnemonic =
    wallet.mnemonic?.phrase;

  const stored =
    makeStoredWallet(
      userId,
      walletName,
      wallet.address,
      privateKey,
      mnemonic,
      "GENERATED",
    );

  addWallet(stored);

  return {
    wallet: stored,

    address: stored.address,

    privateKey,

    mnemonic,

    credentials: {
      privateKey,
      mnemonic,
    },
  };
}

/*
|--------------------------------------------------------------------------
| Get Active Wallet
|--------------------------------------------------------------------------
|
| Compatibility API.
|
| Existing code can continue doing:
|
| getWallet(userId)
|
*/

export function getWallet(
  userId: number,
): StoredWallet | undefined {
  return getActiveWallet(userId);
}

/*
|--------------------------------------------------------------------------
| Get Wallet By ID
|--------------------------------------------------------------------------
|
| New explicit helper for code that needs a specific wallet.
|--------------------------------------------------------------------------
*/

export function getWalletById(
  userId: number,
  walletId: string,
): StoredWallet | undefined {
  return getStoredWallet(
    userId,
    walletId,
  );
}

/*
|--------------------------------------------------------------------------
| Import Private Key
|--------------------------------------------------------------------------
*/

export function importPrivateKey(
  userId: number,
  name: string,
  privateKey: string,
): StoredWallet {
  const walletName =
    uniqueName(
      userId,
      name,
    );

  const key =
    normalizePrivateKey(
      privateKey,
    );

  const wallet =
    new Wallet(key);

  const stored =
    makeStoredWallet(
      userId,
      walletName,
      wallet.address,
      wallet.privateKey,
      undefined,
      "PRIVATE_KEY",
    );

  addWallet(stored);

  return stored;
}

/*
|--------------------------------------------------------------------------
| Generic Wallet Import
|--------------------------------------------------------------------------
|
| Supports both:
|
| importWallet(userId, secret)
|
| and:
|
| importWallet(userId, name, secret)
|
| This fixes older bot code that only supplies
| userId + privateKey.
|--------------------------------------------------------------------------
*/

export function importWallet(
  userId: number,
  secretOrName: string,
  maybeSecret?: string,
): StoredWallet {
  let name: string;
  let secret: string;

  if (
    maybeSecret === undefined
  ) {
    name = "Imported";
    secret = secretOrName;
  } else {
    name = secretOrName;
    secret = maybeSecret;
  }

  const normalized =
    String(secret ?? "")
      .trim()
      .replace(/\s+/g, " ");

  if (!normalized) {
    throw new Error(
      "Wallet secret is required",
    );
  }

  const words =
    normalized.split(" ");

  /*
   * Seed phrase
   */

  if (
    words.length === 12 ||
    words.length === 15 ||
    words.length === 18 ||
    words.length === 21 ||
    words.length === 24
  ) {
    return importSeedPhrase(
      userId,
      name,
      normalized,
    );
  }

  /*
   * Private key
   */

  return importPrivateKey(
    userId,
    name,
    normalized,
  );
}

/*
|--------------------------------------------------------------------------
| Import Seed Phrase
|--------------------------------------------------------------------------
*/

export function importSeedPhrase(
  userId: number,
  name: string,
  phrase: string,
): StoredWallet {
  const walletName =
    uniqueName(
      userId,
      name,
    );

  const normalized =
    String(phrase ?? "")
      .trim()
      .replace(/\s+/g, " ");

  const words =
    normalized.split(" ");

  if (
    ![
      12,
      15,
      18,
      21,
      24,
    ].includes(words.length)
  ) {
    throw new Error(
      "Invalid seed phrase",
    );
  }

  let wallet: HDNodeWallet;

  try {
    wallet =
      HDNodeWallet.fromPhrase(
        normalized,
      );
  } catch {
    throw new Error(
      "Invalid seed phrase",
    );
  }

  const stored =
    makeStoredWallet(
      userId,
      walletName,
      wallet.address,
      wallet.privateKey,
      normalized,
      "SEED_PHRASE",
    );

  addWallet(stored);

  return stored;
}

/*
|--------------------------------------------------------------------------
| Wallet List
|--------------------------------------------------------------------------
*/

export function listWallets(
  userId: number,
): StoredWallet[] {
  return getWallets(userId);
}

/*
|--------------------------------------------------------------------------
| Active Wallet
|--------------------------------------------------------------------------
*/

export function getActiveWalletForUser(
  userId: number,
): StoredWallet | undefined {
  return getActiveWallet(userId);
}

/*
|--------------------------------------------------------------------------
| Switch Active Wallet
|--------------------------------------------------------------------------
*/

export function switchActiveWallet(
  userId: number,
  walletId: string,
): StoredWallet {
  const wallet =
    getStoredWallet(
      userId,
      walletId,
    );

  if (!wallet) {
    throw new Error(
      "Wallet not found",
    );
  }

  return setActiveWallet(
    userId,
    walletId,
  );
}

/*
|--------------------------------------------------------------------------
| Delete Wallet
|--------------------------------------------------------------------------
*/

export function deleteWallet(
  userId: number,
  walletId: string,
): boolean {
  return removeWallet(
    userId,
    walletId,
  );
}

/*
|--------------------------------------------------------------------------
| Wallet Credentials
|--------------------------------------------------------------------------
*/

export function getWalletCredentials(
  userId: number,
  walletId: string,
): WalletCredentials {
  const wallet =
    getStoredWallet(
      userId,
      walletId,
    );

  if (!wallet) {
    throw new Error(
      "Wallet not found",
    );
  }

  return {
    privateKey: wallet.encryptedPrivateKey,
    mnemonic: wallet.encryptedMnemonic ?? undefined,
  };
}

/*
|--------------------------------------------------------------------------
| Active Wallet Credentials
|--------------------------------------------------------------------------
*/

export function getActiveWalletCredentials(
  userId: number,
): WalletCredentials {
  const wallet =
    getActiveWallet(userId);

  if (!wallet) {
    throw new Error(
      "No active wallet",
    );
  }

  return getWalletCredentials(
    userId,
    wallet.id,
  );
}

/*
|--------------------------------------------------------------------------
| Decrypt Private Key
|--------------------------------------------------------------------------
|
| Supports:
|
| decryptPrivateKey(userId)
|
| decryptPrivateKey(userId, walletId)
|
| IMPORTANT:
| Never pass the encrypted key here.
| The function expects a user ID and optionally
| a wallet ID.
|--------------------------------------------------------------------------
*/

export function decryptPrivateKey(
  userId: number,
  walletId?: string,
): string {
  const wallet =
    walletId
      ? getStoredWallet(
          userId,
          walletId,
        )
      : getActiveWallet(userId);

  if (!wallet) {
    throw new Error(
      "Wallet not found",
    );
  }

  return wallet.encryptedPrivateKey;
}

/*
|--------------------------------------------------------------------------
| Balance
|--------------------------------------------------------------------------
*/

export async function getBalance(
  userId: number,
): Promise<string> {
  const wallet =
    getActiveWallet(userId);

  if (!wallet) {
    return "0.0000";
  }

  const rpc =
    process.env.NEXT_PUBLIC_RPC_URL ||
    process.env.RPC_URL;

  if (!rpc) {
    return "0.0000";
  }

  try {
    const response =
      await fetch(
        rpc,
        {
          method: "POST",

          headers: {
            "content-type":
              "application/json",
          },

          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method:
              "eth_getBalance",
            params: [
              wallet.address,
              "latest",
            ],
          }),
        },
      );

    if (!response.ok) {
      return "0.0000";
    }

    const data =
      (await response.json()) as {
        result?: string;
        error?: {
          message?: string;
        };
      };

    if (
      !data.result ||
      data.result === "0x"
    ) {
      return "0.0000";
    }

    const wei =
      BigInt(data.result);

    const base =
      1_000_000_000_000_000_000n;

    const whole =
      wei / base;

    const remainder =
      wei % base;

    const decimals =
      remainder
        .toString()
        .padStart(18, "0")
        .slice(0, 4);

    return `${whole}.${decimals}`;
  } catch {
    return "0.0000";
  }
}

/*
|--------------------------------------------------------------------------
| Get Wallet Address
|--------------------------------------------------------------------------
*/

export function getActiveWalletAddress(
  userId: number,
): string | undefined {
  return getActiveWallet(
    userId,
  )?.address;
}

/*
|--------------------------------------------------------------------------
| Wallet Existence
|--------------------------------------------------------------------------
*/

export function hasWallet(
  userId: number,
): boolean {
  return Boolean(
    getActiveWallet(userId),
  );
}

/*
|--------------------------------------------------------------------------
| Wallet Count
|--------------------------------------------------------------------------
*/

export function getWalletCount(
  userId: number,
): number {
  return getWallets(userId).length;
}

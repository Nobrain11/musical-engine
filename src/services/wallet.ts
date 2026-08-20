import {
  HDNodeWallet,
  Wallet,
  getAddress,
  isAddress,
} from "ethers";

import {
  StoredWallet,
  WalletCredentials,
  WalletSource,
} from "../types";

import {
  encryptSecret,
  decryptSecret,
} from "../utils/crypto";

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
| Types
|--------------------------------------------------------------------------
*/

export interface CreatedWallet {
  wallet: StoredWallet;
  address: string;
  privateKey: string;
  mnemonic?: string;
  credentials: WalletCredentials;
}

export interface WalletListItem {
  id: string;
  name: string;
  address: string;
  source: WalletSource;
  active: boolean;
  createdAt: number;
}

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function normalizeName(
  name: string,
): string {
  const normalized =
    String(name ?? "").trim();

  if (!normalized) {
    throw new Error(
      "Wallet name is required",
    );
  }

  if (normalized.length > 32) {
    throw new Error(
      "Wallet name must be 32 characters or less",
    );
  }

  return normalized;
}

function ensureUniqueName(
  userId: number,
  name: string,
): string {
  const normalized =
    normalizeName(name);

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

function normalizeAddress(
  address: string,
): string {
  const value =
    String(address ?? "").trim();

  if (!isAddress(value)) {
    throw new Error(
      "Invalid wallet address",
    );
  }

  return getAddress(value);
}

function normalizePrivateKey(
  privateKey: string,
): string {
  const value =
    String(privateKey ?? "").trim();

  if (
    !/^0x[0-9a-fA-F]{64}$/.test(
      value,
    )
  ) {
    throw new Error(
      "Invalid private key",
    );
  }

  return value;
}

function normalizeSeedPhrase(
  phrase: string,
): string {
  const normalized =
    String(phrase ?? "")
      .trim()
      .replace(/\s+/g, " ");

  const words =
    normalized
      ? normalized.split(" ")
      : [];

  const validLength =
    words.length === 12 ||
    words.length === 15 ||
    words.length === 18 ||
    words.length === 21 ||
    words.length === 24;

  if (!validLength) {
    throw new Error(
      "Seed phrase must contain 12, 15, 18, 21 or 24 words",
    );
  }

  return normalized;
}

function buildStoredWallet(
  userId: number,
  name: string,
  address: string,
  privateKey: string,
  mnemonic: string | undefined,
  source: WalletSource,
): StoredWallet {
  const now =
    Date.now();

  return {
    id:
      createWalletId(),

    userId,

    name:
      normalizeName(name),

    address:
      normalizeAddress(address),

    encryptedPrivateKey:
      encryptSecret(
        privateKey,
      ),

    encryptedMnemonic:
      mnemonic
        ? encryptSecret(
            mnemonic,
          )
        : null,

    source,

    createdAt:
      now,

    updatedAt:
      now,
  };
}

/*
|--------------------------------------------------------------------------
| CREATE WALLET
|--------------------------------------------------------------------------
*/

export function createWallet(
  userId: number,
  name = "Main",
): CreatedWallet {
  const walletName =
    ensureUniqueName(
      userId,
      name,
    );

  const wallet =
    HDNodeWallet.createRandom();

  const privateKey =
    wallet.privateKey;

  const mnemonic =
    wallet.mnemonic?.phrase;

  if (!mnemonic) {
    throw new Error(
      "Failed to generate wallet seed phrase",
    );
  }

  const stored =
    buildStoredWallet(
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

    address:
      stored.address,

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
| GET WALLET
|--------------------------------------------------------------------------
|
| Compatibility:
|
| getWallet(userId)
| -> active wallet
|
| getWallet(userId, walletId)
| -> specific wallet
|--------------------------------------------------------------------------
*/

export function getWallet(
  userId: number,
  walletId?: string,
): StoredWallet | undefined {
  if (walletId) {
    const wallet =
      getStoredWallet(
        userId,
        walletId,
      );

    if (
      !wallet ||
      wallet.userId !== userId
    ) {
      return undefined;
    }

    return wallet;
  }

  return getActiveWallet(
    userId,
  );
}

/*
|--------------------------------------------------------------------------
| IMPORT PRIVATE KEY
|--------------------------------------------------------------------------
*/

export function importPrivateKey(
  userId: number,
  name: string,
  privateKey: string,
): StoredWallet {
  const walletName =
    ensureUniqueName(
      userId,
      name,
    );

  const normalizedKey =
    normalizePrivateKey(
      privateKey,
    );

  let wallet: Wallet;

  try {
    wallet =
      new Wallet(
        normalizedKey,
      );
  } catch {
    throw new Error(
      "Unable to import private key",
    );
  }

  const stored =
    buildStoredWallet(
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
| IMPORT SEED PHRASE
|--------------------------------------------------------------------------
*/

export function importSeedPhrase(
  userId: number,
  name: string,
  phrase: string,
): StoredWallet {
  const walletName =
    ensureUniqueName(
      userId,
      name,
    );

  const normalizedPhrase =
    normalizeSeedPhrase(
      phrase,
    );

  let wallet: HDNodeWallet;

  try {
    wallet =
      HDNodeWallet.fromPhrase(
        normalizedPhrase,
      );
  } catch {
    throw new Error(
      "Invalid seed phrase",
    );
  }

  const stored =
    buildStoredWallet(
      userId,
      walletName,
      wallet.address,
      wallet.privateKey,
      normalizedPhrase,
      "SEED_PHRASE",
    );

  addWallet(stored);

  return stored;
}

/*
|--------------------------------------------------------------------------
| GENERIC IMPORT
|--------------------------------------------------------------------------
|
| Automatically detects:
|
| 12/15/18/21/24 words -> seed phrase
| 0x + 64 hex chars -> private key
|--------------------------------------------------------------------------
*/

export function importWallet(
  userId: number,
  name: string,
  secret: string,
): StoredWallet {
  const normalized =
    String(secret ?? "")
      .trim()
      .replace(/\s+/g, " ");

  if (!normalized) {
    throw new Error(
      "Wallet import data is required",
    );
  }

  const words =
    normalized.split(" ");

  const looksLikeSeed =
    words.length === 12 ||
    words.length === 15 ||
    words.length === 18 ||
    words.length === 21 ||
    words.length === 24;

  if (looksLikeSeed) {
    return importSeedPhrase(
      userId,
      name,
      normalized,
    );
  }

  return importPrivateKey(
    userId,
    name,
    normalized,
  );
}

/*
|--------------------------------------------------------------------------
| WALLET LIST
|--------------------------------------------------------------------------
*/

export function listWallets(
  userId: number,
): WalletListItem[] {
  const active =
    getActiveWallet(
      userId,
    );

  return getWallets(
    userId,
  ).map(
    (wallet) => ({
      id:
        wallet.id,

      name:
        wallet.name,

      address:
        wallet.address,

      source:
        wallet.source,

      active:
        wallet.id ===
        active?.id,

      createdAt:
        wallet.createdAt,
    }),
  );
}

/*
|--------------------------------------------------------------------------
| GET ALL STORED WALLETS
|--------------------------------------------------------------------------
*/

export function getAllWallets(
  userId: number,
): StoredWallet[] {
  return getWallets(
    userId,
  );
}

/*
|--------------------------------------------------------------------------
| ACTIVE WALLET
|--------------------------------------------------------------------------
*/

export function getActiveWalletForUser(
  userId: number,
): StoredWallet | undefined {
  return getActiveWallet(
    userId,
  );
}

/*
|--------------------------------------------------------------------------
| SWITCH ACTIVE WALLET
|--------------------------------------------------------------------------
*/

export function switchActiveWallet(
  userId: number,
  walletId: string,
): StoredWallet {
  const wallet =
    getWallet(
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
| DELETE WALLET
|--------------------------------------------------------------------------
*/

export function deleteWallet(
  userId: number,
  walletId: string,
): boolean {
  const wallet =
    getWallet(
      userId,
      walletId,
    );

  if (!wallet) {
    return false;
  }

  return removeWallet(
    userId,
    walletId,
  );
}

/*
|--------------------------------------------------------------------------
| WALLET COUNT
|--------------------------------------------------------------------------
*/

export function walletCount(
  userId: number,
): number {
  return getWallets(
    userId,
  ).length;
}

/*
|--------------------------------------------------------------------------
| FIND WALLET BY ADDRESS
|--------------------------------------------------------------------------
*/

export function findWalletByAddress(
  userId: number,
  address: string,
): StoredWallet | undefined {
  const normalized =
    normalizeAddress(
      address,
    );

  return getWallets(
    userId,
  ).find(
    (wallet) =>
      wallet.address.toLowerCase() ===
      normalized.toLowerCase(),
  );
}

/*
|--------------------------------------------------------------------------
| GET WALLET CREDENTIALS
|--------------------------------------------------------------------------
*/

export function getWalletCredentials(
  userId: number,
  walletId: string,
): WalletCredentials {
  const wallet =
    getWallet(
      userId,
      walletId,
    );

  if (!wallet) {
    throw new Error(
      "Wallet not found",
    );
  }

  return {
    privateKey:
      decryptSecret(
        wallet.encryptedPrivateKey,
      ),

    mnemonic:
      wallet.encryptedMnemonic
        ? decryptSecret(
            wallet.encryptedMnemonic,
          )
        : undefined,
  };
}

/*
|--------------------------------------------------------------------------
| ACTIVE WALLET CREDENTIALS
|--------------------------------------------------------------------------
*/

export function getActiveWalletCredentials(
  userId: number,
): WalletCredentials {
  const wallet =
    getActiveWallet(
      userId,
    );

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
| DECRYPT PRIVATE KEY
|--------------------------------------------------------------------------
|
| Compatibility API used by execution.ts
|--------------------------------------------------------------------------
*/

export function decryptPrivateKey(
  userId: number,
  walletId?: string,
): string {
  const wallet =
    walletId
      ? getWallet(
          userId,
          walletId,
        )
      : getActiveWallet(
          userId,
        );

  if (!wallet) {
    throw new Error(
      "Wallet not found",
    );
  }

  return decryptSecret(
    wallet.encryptedPrivateKey,
  );
}

/*
|--------------------------------------------------------------------------
| EXPORT WALLET
|--------------------------------------------------------------------------
|
| Returns credentials only after explicitly requesting
| the wallet.
|--------------------------------------------------------------------------
*/

export function exportWallet(
  userId: number,
  walletId: string,
): WalletCredentials {
  return getWalletCredentials(
    userId,
    walletId,
  );
}

/*
|--------------------------------------------------------------------------
| EXPORT ACTIVE WALLET
|--------------------------------------------------------------------------
*/

export function exportActiveWallet(
  userId: number,
): WalletCredentials {
  return getActiveWalletCredentials(
    userId,
  );
}

/*
|--------------------------------------------------------------------------
| WALLET BALANCE
|--------------------------------------------------------------------------
*/

export async function getBalance(
  userId: number,
): Promise<string> {
  const wallet =
    getActiveWallet(
      userId,
    );

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
      };

    if (
      !data.result ||
      typeof data.result !==
        "string"
    ) {
      return "0.0000";
    }

    const wei =
      BigInt(
        data.result,
      );

    const base =
      1_000_000_000_000_000_000n;

    const whole =
      wei / base;

    const remainder =
      wei % base;

    const decimals =
      remainder
        .toString()
        .padStart(
          18,
          "0",
        )
        .slice(
          0,
          4,
        );

    return `${whole}.${decimals}`;
  } catch {
    return "0.0000";
  }
}

/*
|--------------------------------------------------------------------------
| VALIDATE WALLET
|--------------------------------------------------------------------------
*/

export function isWalletAddress(
  address: string,
): boolean {
  try {
    return isAddress(
      address.trim(),
    );
  } catch {
    return false;
  }
}

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
  getWallet,
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
    name.trim();

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
    address.trim();

  if (!isAddress(value)) {
    throw new Error(
      "Invalid wallet address",
    );
  }

  return getAddress(value);
}

function buildStoredWallet(
  userId: number,
  name: string,
  address: string,
  privateKey: string,
  mnemonic: string | undefined,
  source: WalletSource,
): StoredWallet {
  return {
    id: createWalletId(),

    userId,

    name,

    address:
      normalizeAddress(address),

    encryptedPrivateKey:
      encryptSecret(privateKey),

    encryptedMnemonic:
      mnemonic
        ? encryptSecret(mnemonic)
        : null,

    source,

    createdAt:
      Date.now(),

    updatedAt:
      Date.now(),
  };
}

/*
|--------------------------------------------------------------------------
| Create Wallet
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

    credentials: {
      privateKey,
      mnemonic,
    },
  };
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
    ensureUniqueName(
      userId,
      name,
    );

  const normalizedKey =
    privateKey.trim();

  if (!/^0x[0-9a-fA-F]{64}$/.test(
    normalizedKey,
  )) {
    throw new Error(
      "Invalid private key",
    );
  }

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
| Import Seed Phrase
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
    phrase
      .trim()
      .replace(/\s+/g, " ");

  const words =
    normalizedPhrase.split(" ");

  if (
    words.length !== 12 &&
    words.length !== 15 &&
    words.length !== 18 &&
    words.length !== 21 &&
    words.length !== 24
  ) {
    throw new Error(
      "Invalid seed phrase",
    );
  }

  let wallet:
    | HDNodeWallet;

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
| Wallet List
|--------------------------------------------------------------------------
*/

export function listWallets(
  userId: number,
): WalletListItem[] {
  const active =
    getActiveWallet(userId);

  return getWallets(userId).map(
    (wallet) => ({
      id: wallet.id,
      name: wallet.name,
      address: wallet.address,
      source: wallet.source,
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
| Get Wallet
|--------------------------------------------------------------------------
*/

export function getWalletById(
  userId: number,
  walletId: string,
): StoredWallet | undefined {
  const wallet =
    getWallet(
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

/*
|--------------------------------------------------------------------------
| Active Wallet
|--------------------------------------------------------------------------
*/

export function getActiveWalletForUser(
  userId: number,
): StoredWallet | undefined {
  return getActiveWallet(
    userId,
  );
}

export function switchActiveWallet(
  userId: number,
  walletId: string,
): StoredWallet {
  const wallet =
    getWalletById(
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
| Remove Wallet
|--------------------------------------------------------------------------
*/

export function deleteWallet(
  userId: number,
  walletId: string,
): boolean {
  const wallet =
    getWalletById(
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
| Secure Credentials
|--------------------------------------------------------------------------
*/

export function getWalletCredentials(
  userId: number,
  walletId: string,
): WalletCredentials {
  const wallet =
    getWalletById(
      userId,
      walletId,
    );

  if (!wallet) {
    throw new Error(
      "Wallet not found",
    );
  }

  const privateKey =
    decryptSecret(
      wallet.encryptedPrivateKey,
    );

  const mnemonic =
    wallet.encryptedMnemonic
      ? decryptSecret(
          wallet.encryptedMnemonic,
        )
      : undefined;

  return {
    privateKey,
    mnemonic,
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
    getActiveWalletForUser(
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
| Address Lookup
|--------------------------------------------------------------------------
*/

export function findWalletByAddress(
  userId: number,
  address: string,
): StoredWallet | undefined {
  const normalized =
    normalizeAddress(address);

  return getWallets(userId).find(
    (wallet) =>
      wallet.address.toLowerCase() ===
      normalized.toLowerCase(),
  );
}

/*
|--------------------------------------------------------------------------
| Wallet Count
|--------------------------------------------------------------------------
*/

export function walletCount(
  userId: number,
): number {
  return getWallets(userId).length;
}

/*
|--------------------------------------------------------------------------
| Wallet Balance
|--------------------------------------------------------------------------
|
| This keeps the existing bot API compatible.
| Replace the RPC implementation here when your
| existing balance provider is connected.
|--------------------------------------------------------------------------
*/

export async function getBalance(
  userId: number,
): Promise<string> {
  const wallet =
    getActiveWalletForUser(
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
      await fetch(rpc, {
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
      });

    if (!response.ok) {
      return "0.0000";
    }

    const data =
      (await response.json()) as {
        result?: string;
      };

    if (!data.result) {
      return "0.0000";
    }

    const hex =
      data.result;

    const wei =
      BigInt(hex);

    const whole =
      wei / 1_000_000_000_000_000_000n;

    const remainder =
      wei %
      1_000_000_000_000_000_000n;

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

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
| Helpers
|--------------------------------------------------------------------------
*/

function normalizeName(
  name: string,
): string {
  const value = name.trim();

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

function normalizePrivateKey(
  privateKey: string,
): string {
  const key = privateKey.trim();

  if (
    !/^0x[0-9a-fA-F]{64}$/.test(
      key,
    )
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
  const value = address.trim();

  if (!isAddress(value)) {
    throw new Error(
      "Invalid wallet address",
    );
  }

  return getAddress(value);
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

    address:
      normalizeAddress(address),

    encryptedPrivateKey:
      encryptSecret(privateKey),

    encryptedMnemonic:
      mnemonic
        ? encryptSecret(mnemonic)
        : null,

    source,

    createdAt: now,
    updatedAt: now,
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
    uniqueName(
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
| Compatibility getWallet API
|--------------------------------------------------------------------------
|
| getWallet(userId)
|     -> active wallet
|
| getWallet(userId, walletId)
|     -> specific wallet
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

  return getActiveWallet(userId);
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

  let wallet: Wallet;

  try {
    wallet =
      new Wallet(key);
  } catch {
    throw new Error(
      "Unable to import private key",
    );
  }

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
    phrase
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
    ].includes(
      words.length,
    )
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
| Generic Import
|--------------------------------------------------------------------------
*/

export function importWallet(
  userId: number,
  nameOrSecret: string,
  secretMaybe?: string,
): StoredWallet {
  /*
   * Supports both:
   *
   * importWallet(userId, name, secret)
   *
   * and older:
   *
   * importWallet(userId, secret)
   */

  let name: string;
  let secret: string;

  if (
    secretMaybe === undefined
  ) {
    name = "Imported";
    secret = nameOrSecret;
  } else {
    name = nameOrSecret;
    secret = secretMaybe;
  }

  const normalized =
    secret
      .trim()
      .replace(/\s+/g, " ");

  const words =
    normalized.split(" ");

  if (
    [
      12,
      15,
      18,
      21,
      24,
    ].includes(words.length)
  ) {
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
| Credentials
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
*/

export function decryptPrivateKey(
  userId: number,
  walletId?: string,
): string {
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

  return decryptSecret(
    wallet.encryptedPrivateKey,
  );
}

/*
|--------------------------------------------------------------------------
| Find Wallet
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
| Count
|--------------------------------------------------------------------------
*/

export function walletCount(
  userId: number,
): number {
  return getWallets(userId).length;
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
      };

    if (!data.result) {
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

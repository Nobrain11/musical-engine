import {
  HDNodeWallet,
  Wallet,
  isAddress,
  getAddress,
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

function normalizeName(
  name: string,
): string {
  const value =
    name.trim();

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
  const key =
    privateKey.trim();

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
  return {
    id:
      createWalletId(),

    userId,

    name,

    address:
      normalizeAddress(
        address,
      ),

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
      Date.now(),

    updatedAt:
      Date.now(),
  };
}

/*
|--------------------------------------------------------------------------
| Generate
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
| Compatibility API
|--------------------------------------------------------------------------
*/

export function getWallet(
  userId: number,
): StoredWallet | undefined {
  return getActiveWallet(
    userId,
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
| Generic import compatibility
|--------------------------------------------------------------------------
*/

export function importWallet(
  userId: number,
  name: string,
  secret: string,
): StoredWallet {
  const normalized =
    secret
      .trim()
      .replace(/\s+/g, " ");

  const words =
    normalized.split(" ");

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

  return importPrivateKey(
    userId,
    name,
    normalized,
  );
}

/*
|--------------------------------------------------------------------------
| Import Seed
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

  const wallet =
    HDNodeWallet.fromPhrase(
      normalized,
    );

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
| Wallet list
|--------------------------------------------------------------------------
*/

export function listWallets(
  userId: number,
): StoredWallet[] {
  return getWallets(userId);
}

/*
|--------------------------------------------------------------------------
| Active wallet
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
| Delete
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
| Compatibility export
|--------------------------------------------------------------------------
*/

type ConfirmationInput = {
  userId: number;
  tokenAddress: string;
  symbol: string;
  side: "BUY" | "SELL";
  amountEth: number;
  slippage: number;
  expiresAt: number;
};

const pendingConfirmations = new Map<number, ConfirmationInput>();

export function createConfirmation(input: ConfirmationInput): ConfirmationInput {
  pendingConfirmations.set(input.userId, input);
  return input;
}

export function getConfirmation(userId: number): ConfirmationInput | undefined {
  const confirmation = pendingConfirmations.get(userId);
  if (confirmation && confirmation.expiresAt < Date.now()) {
    pendingConfirmations.delete(userId);
    return undefined;
  }
  return confirmation;
}

export function removeConfirmation(userId: number): ConfirmationInput | undefined {
  const confirmation = getConfirmation(userId);
  pendingConfirmations.delete(userId);
  return confirmation;
}

export function decryptPrivateKey(
  userId: number,
  walletId?: string,
): string {
  const wallet =
    walletId
  ? getWallet(
  userId,
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
| Balance
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

    if (!data.result) {
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

import crypto from "crypto";

import {
  StoredWallet,
  UserWalletState,
} from "../types";

const users =
  new Map<number, UserWalletState>();

function getState(
  userId: number,
): UserWalletState {
  let state = users.get(userId);

  if (!state) {
    state = {
      userId,
      wallets: [],
      updatedAt: Date.now(),
    };

    users.set(userId, state);
  }

  return state;
}

export function getWallets(
  userId: number,
): StoredWallet[] {
  return [...getState(userId).wallets];
}

export function getWallet(
  userId: number,
  walletId: string,
): StoredWallet | undefined {
  return getState(userId).wallets.find(
    (wallet) =>
      wallet.id === walletId,
  );
}

export function addWallet(
  wallet: StoredWallet,
): StoredWallet {
  const state =
    getState(wallet.userId);

  state.wallets.push(wallet);

  if (!state.activeWalletId) {
    state.activeWalletId =
      wallet.id;
  }

  state.updatedAt = Date.now();

  return wallet;
}

export function removeWallet(
  userId: number,
  walletId: string,
): boolean {
  const state = getState(userId);

  const index =
    state.wallets.findIndex(
      (wallet) =>
        wallet.id === walletId,
    );

  if (index === -1) {
    return false;
  }

  state.wallets.splice(index, 1);

  if (
    state.activeWalletId ===
    walletId
  ) {
    state.activeWalletId =
      state.wallets[0]?.id;
  }

  state.updatedAt = Date.now();

  return true;
}

export function setActiveWallet(
  userId: number,
  walletId: string,
): StoredWallet {
  const state = getState(userId);

  const wallet =
    state.wallets.find(
      (item) =>
        item.id === walletId,
    );

  if (!wallet) {
    throw new Error(
      "Wallet not found",
    );
  }

  state.activeWalletId =
    walletId;

  state.updatedAt = Date.now();

  return wallet;
}

export function getActiveWallet(
  userId: number,
): StoredWallet | undefined {
  const state = getState(userId);

  if (!state.activeWalletId) {
    return undefined;
  }

  return state.wallets.find(
    (wallet) =>
      wallet.id ===
      state.activeWalletId,
  );
}

export function walletNameExists(
  userId: number,
  name: string,
): boolean {
  return getState(userId).wallets.some(
    (wallet) =>
      wallet.name.toLowerCase() ===
      name.trim().toLowerCase(),
  );
}

export function createWalletId(): string {
  return crypto.randomUUID();
}

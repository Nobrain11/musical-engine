// src/services/confirmation.ts

import type {
  TradeSide,
} from "../types";

export interface PendingTrade {
  userId: number;

  tokenAddress: string;

  symbol: string;

  side: TradeSide;

  amountEth: string;

  slippage: number;

  expiresAt: number;
}

const pendingTrades =
  new Map<
    number,
    PendingTrade
  >();

export function createConfirmation(
  trade: PendingTrade,
): PendingTrade {
  pendingTrades.set(
    trade.userId,
    trade,
  );

  return trade;
}

export function getConfirmation(
  userId: number,
): PendingTrade | undefined {
  const trade =
    pendingTrades.get(userId);

  if (!trade) {
    return undefined;
  }

  if (
    Date.now() >
    trade.expiresAt
  ) {
    pendingTrades.delete(userId);

    return undefined;
  }

  return trade;
}

export function removeConfirmation(
  userId: number,
): void {
  pendingTrades.delete(userId);
}

export function clearExpiredConfirmations(): void {
  const now =
    Date.now();

  for (
    const [
      userId,
      trade,
    ] of pendingTrades
  ) {
    if (
      now >
      trade.expiresAt
    ) {
      pendingTrades.delete(
        userId,
      );
    }
  }
}

export function hasConfirmation(
  userId: number,
): boolean {
  return (
    getConfirmation(userId) !==
    undefined
  );
}

setInterval(
  clearExpiredConfirmations,
  10_000,
).unref();

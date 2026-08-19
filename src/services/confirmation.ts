import { randomUUID } from "crypto";
import {
  PendingTrade,
  TradeSide,
} from "../types";

export interface ConfirmationTrade
  extends PendingTrade {
  id: string;
  createdAt: number;
}

const confirmations =
  new Map<number, ConfirmationTrade>();

const DEFAULT_EXPIRY_MS = 60_000;

export function createConfirmation(
  trade: PendingTrade,
): ConfirmationTrade {
  const confirmation: ConfirmationTrade = {
    ...trade,
    id: randomUUID(),
    createdAt: Date.now(),
  };

  confirmations.set(
    trade.userId,
    confirmation,
  );

  return confirmation;
}

export function getConfirmation(
  userId: number,
): ConfirmationTrade | undefined {
  const confirmation =
    confirmations.get(userId);

  if (!confirmation) {
    return undefined;
  }

  if (
    Date.now() >
    confirmation.expiresAt
  ) {
    confirmations.delete(userId);
    return undefined;
  }

  return confirmation;
}

export function removeConfirmation(
  userId: number,
): void {
  confirmations.delete(userId);
}

export function clearConfirmation(
  userId: number,
): void {
  confirmations.delete(userId);
}

export function hasConfirmation(
  userId: number,
): boolean {
  return (
    getConfirmation(userId) !==
    undefined
  );
}

export function createTradeConfirmation(
  userId: number,
  tokenAddress: string,
  symbol: string,
  side: TradeSide,
  amountEth: string,
  slippage: number,
  expiryMs = DEFAULT_EXPIRY_MS,
): ConfirmationTrade {
  return createConfirmation({
    userId,
    tokenAddress,
    symbol,
    side,
    amountEth,
    slippage,
    expiresAt:
      Date.now() + expiryMs,
  });
}

export function cleanupConfirmations(): void {
  const now = Date.now();

  for (
    const [
      userId,
      confirmation,
    ] of confirmations.entries()
  ) {
    if (
      now >
      confirmation.expiresAt
    ) {
      confirmations.delete(userId);
    }
  }
}

const cleanupTimer =
  setInterval(
    cleanupConfirmations,
    10_000,
  );

cleanupTimer.unref();

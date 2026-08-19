import {
  ConfirmationTrade,
  PendingTrade,
  TradeSide,
} from "../types";

const confirmations =
  new Map<number, ConfirmationTrade>();

const DEFAULT_SLIPPAGE = 0.5;

export interface CreateConfirmationInput {
  userId: number;

  tokenAddress: string;

  symbol: string;

  side: TradeSide;

  amountEth: string;

  slippage?: number;

  expiresAt?: number;

  walletId?: string;

  walletAddress?: string;
}

export function createConfirmation(
  input: CreateConfirmationInput,
): ConfirmationTrade {
  const trade: ConfirmationTrade = {
    id: `${input.userId}-${Date.now()}`,

    userId:
      input.userId,

    tokenAddress:
      input.tokenAddress,

    symbol:
      input.symbol,

    side:
      input.side,

    amountEth:
      input.amountEth,

    slippage:
      input.slippage ??
      DEFAULT_SLIPPAGE,

    expiresAt:
      input.expiresAt ??
      Date.now() + 30_000,

    createdAt:
      Date.now(),

    walletId:
      input.walletId,

    walletAddress:
      input.walletAddress,
  };

  confirmations.set(
    input.userId,
    trade,
  );

  return trade;
}

export function getConfirmation(
  userId: number,
): ConfirmationTrade | undefined {
  const trade =
    confirmations.get(userId);

  if (!trade) {
    return undefined;
  }

  if (
    Date.now() >
    trade.expiresAt
  ) {
    confirmations.delete(userId);

    return undefined;
  }

  return trade;
}

export function removeConfirmation(
  userId: number,
): void {
  confirmations.delete(
    userId,
  );
}

export function clearConfirmation(
  userId: number,
): void {
  removeConfirmation(
    userId,
  );
}

export function hasConfirmation(
  userId: number,
): boolean {
  return (
    getConfirmation(userId) !==
    undefined
  );
}

export function confirmationToPendingTrade(
  trade: ConfirmationTrade,
): PendingTrade {
  return {
    id: trade.id,

    userId:
      trade.userId,

    tokenAddress:
      trade.tokenAddress,

    symbol:
      trade.symbol,

    side:
      trade.side,

    amountEth:
      trade.amountEth,

    slippage:
      trade.slippage,

    expiresAt:
      trade.expiresAt,

    createdAt:
      trade.createdAt,

    walletId:
      trade.walletId,

    walletAddress:
      trade.walletAddress,
  };
}

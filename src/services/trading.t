import { TradeResult } from "../types";
import { getToken } from "./market";
import { validateTrade } from "./risk";

export async function simulateBuy(
  address: string,
  amountEth: string,
): Promise<TradeResult> {
  const token = await getToken(address);

  if (!token) {
    return {
      success: false,
      amountIn: amountEth,
      error: "Token not found",
    };
  }

  const risk = validateTrade(
    token,
    Number(amountEth),
  );

  if (!risk.allowed) {
    return {
      success: false,
      amountIn: amountEth,
      error: risk.reasons.join(", "),
    };
  }

  /*
   * REAL transaction simulation goes here.
   */

  return {
    success: true,
    amountIn: amountEth,
    priceImpact: 0,
  };
}

export async function executeBuy(
  userId: number,
  address: string,
  amountEth: string,
  slippage: number,
): Promise<TradeResult> {
  const simulation = await simulateBuy(
    address,
    amountEth,
  );

  if (!simulation.success) {
    return simulation;
  }

  /*
   * REAL execution goes here.
   *
   * Required:
   *
   * 1. Check token state.
   * 2. Check migrated flag.
   * 3. Select correct trading route.
   * 4. Simulate.
   * 5. Sign transaction.
   * 6. Broadcast.
   * 7. Wait for confirmation.
   */

  return {
    success: false,
    amountIn: amountEth,
    error:
      "Trading executor not connected",
  };
}

export async function executeSell(
  userId: number,
  address: string,
  percentage: number,
  slippage: number,
): Promise<TradeResult> {
  /*
   * Real sell implementation.
   */

  return {
    success: false,
    amountIn: "0",
    error:
      "Trading executor not connected",
  };
}

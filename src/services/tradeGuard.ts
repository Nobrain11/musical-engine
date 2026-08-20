import {
  Token,
} from "../types";

export interface TradeRequest {
  side:
    | "BUY"
    | "SELL";

  token: Token;

  amountEth: number;

  slippage: number;
}

export interface TradeGuardResult {
  approved: boolean;

  score: number;

  reasons: string[];

  warnings: string[];
}

export function evaluateTrade(
  request: TradeRequest,
): TradeGuardResult {
  const {
    token,
    amountEth,
    slippage,
  } = request;

  const reasons: string[] = [];
  const warnings: string[] = [];

  let score = 100;

  /*
   * Risk
   */

  score -=
    token.riskScore * 0.25;

  if (
    token.riskScore > 60
  ) {
    warnings.push(
      "Token risk is elevated",
    );
  }

  /*
   * Liquidity
   */

  const liquidity =
    token.liquidity ?? 0;

  if (
    liquidity < 25_000
  ) {
    score -= 25;

    reasons.push(
      "Liquidity is too low",
    );
  } else if (
    liquidity < 100_000
  ) {
    score -= 10;

    warnings.push(
      "Liquidity is relatively thin",
    );
  }

  /*
   * Momentum
   */

  if (
    token.momentumScore < 50
  ) {
    score -= 20;

    warnings.push(
      "Momentum is weak",
    );
  }

  /*
   * Smart money
   */

  if (
    token.smartMoneyScore < 40
  ) {
    score -= 10;

    warnings.push(
      "Weak smart-money activity",
    );
  }

  /*
   * Buy pressure
   */

  if (
    request.side === "BUY" &&
    token.buyPressure < 40
  ) {
    score -= 10;

    warnings.push(
      "Buying pressure is weak",
    );
  }

  /*
   * Slippage
   */

  if (
    slippage > 5
  ) {
    score -= 15;

    reasons.push(
      "Slippage exceeds safe limit",
    );
  } else if (
    slippage > 2
  ) {
    warnings.push(
      "High slippage configured",
    );
  }

  /*
   * Trade size
   */

  if (
    liquidity > 0 &&
    amountEth >
      liquidity * 0.01
  ) {
    score -= 20;

    reasons.push(
      "Trade size is large relative to liquidity",
    );
  }

  score =
    Math.max(
      0,
      Math.min(
        100,
        Math.round(score),
      ),
    );

  const approved =
    score >= 70 &&
    reasons.length === 0;

  return {
    approved,

    score,

    reasons,

    warnings,
  };
}

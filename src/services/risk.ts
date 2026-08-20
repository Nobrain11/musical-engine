import { Token } from "../types";

export interface RiskResult {
  allowed: boolean;
  score: number;
  reasons: string[];
}

export function evaluateToken(
  token: Token,
): RiskResult {
  const reasons: string[] = [];

  if (token.riskScore > 70) {
    reasons.push(
      "High token risk",
    );
  }

  if (token.liquidity < 10_000) {
    reasons.push(
      "Liquidity too low",
    );
  }

  if ((token.marketCap ?? 0) < 10_000) {
    reasons.push(
      "Market cap too low",
    );
  }

  return {
    allowed:
      token.riskScore <= 70 &&
      token.liquidity >= 10_000,

    score: token.riskScore,

    reasons,
  };
}

export function validateTrade(
  token: Token,
  amountEth: number,
): RiskResult {
  const risk = evaluateToken(token);

  if (amountEth <= 0) {
    return {
      allowed: false,
      score: 100,
      reasons: ["Invalid trade amount"],
    };
  }

  return risk;
}

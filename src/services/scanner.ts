import { Token } from "../types";
import * as market from "./market";

export interface ScanResult {
  token: Token;
  score: number;
  reasons: string[];
}

export async function analyzeToken(
  address: string,
): Promise<ScanResult | null> {
  const token = await market.getToken(address);

  if (!token) return null;

  const score = calculateScore(token);

  const reasons: string[] = [];

  if (token.momentumScore >= 85) {
    reasons.push(
      "Strong momentum detected",
    );
  }

  if (token.smartMoneyScore >= 80) {
    reasons.push(
      "Smart money accumulation detected",
    );
  }

  if (token.liquidityScore >= 80) {
    reasons.push(
      "Healthy liquidity",
    );
  }

  if (token.buyPressure >= 70) {
    reasons.push(
      "Strong buying pressure",
    );
  }

  return {
    token,
    score,
    reasons,
  };
}

function calculateScore(
  token: Token,
): number {
  return Math.round(
    token.momentumScore * 0.30 +
    token.smartMoneyScore * 0.30 +
    token.liquidityScore * 0.20 +
    (100 - token.riskScore) * 0.20,
  );
}

export async function scanMarket(): Promise<
  ScanResult[]
> {
  /*
   * This becomes the main sniper/autopilot scanner.
   */

  return [];
}

import {
  SniperConfig,
  Token,
} from "../types";

const configs = new Map<
  number,
  SniperConfig
>();

export function getSniperConfig(
  userId: number,
): SniperConfig {
  return (
    configs.get(userId) ?? {
      enabled: false,

      minLiquidity: 50_000,
      maxMarketCap: 1_000_000,

      minScore: 85,
      maxRisk: 30,

      maxBuyEth: "0.10",
      maxPositions: 5,

      slippage: 1,
    }
  );
}

export function updateSniperConfig(
  userId: number,
  config: SniperConfig,
) {
  configs.set(userId, config);
}

export function matchesSniper(
  token: Token,
  config: SniperConfig,
): boolean {
  return (
    token.liquidity >=
      config.minLiquidity &&
    token.marketCap <=
      config.maxMarketCap &&
    token.momentumScore >=
      config.minScore &&
    token.riskScore <=
      config.maxRisk &&
    token.smartMoneyScore >= 80
  );
}

export function startSniper(
  userId: number,
) {
  const config =
    getSniperConfig(userId);

  config.enabled = true;

  configs.set(userId, config);
}

export function stopSniper(
  userId: number,
) {
  const config =
    getSniperConfig(userId);

  config.enabled = false;

  configs.set(userId, config);
}

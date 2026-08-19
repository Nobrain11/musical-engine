import {
  AutopilotConfig,
  Token,
} from "../types";

const configs = new Map<
  number,
  AutopilotConfig
>();

export function getAutopilotConfig(
  userId: number,
): AutopilotConfig {
  return (
    configs.get(userId) ?? {
      enabled: false,

      capitalEth: "1.00",
      maxTradeEth: "0.25",
      maxPositions: 4,

      minScore: 85,
      maxRisk: 30,
      minLiquidity: 100_000,

      stopLossPercent: 20,
      trailingStopPercent: 15,

      takeProfitLevels: [
        50,
        100,
        200,
      ],
    }
  );
}

export function shouldTrade(
  token: Token,
  config: AutopilotConfig,
): boolean {
  return (
    config.enabled &&
    token.momentumScore >=
      config.minScore &&
    token.riskScore <=
      config.maxRisk &&
    token.liquidity >=
      config.minLiquidity
  );
}

export function startAutopilot(
  userId: number,
) {
  const config =
    getAutopilotConfig(userId);

  config.enabled = true;

  configs.set(userId, config);
}

export function stopAutopilot(
  userId: number,
) {
  const config =
    getAutopilotConfig(userId);

  config.enabled = false;

  configs.set(userId, config);
}

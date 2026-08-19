// src/services/autopilot.ts

import {
  AutopilotConfig,
} from "../types";

const autopilotConfigs =
  new Map<
    number,
    AutopilotConfig
  >();

function numberEnv(
  name: string,
  fallback: number,
): number {
  const value =
    process.env[name];

  if (!value) {
    return fallback;
  }

  const parsed =
    Number(value);

  return Number.isFinite(
    parsed,
  )
    ? parsed
    : fallback;
}

function createDefaultConfig(): AutopilotConfig {
  return {
    enabled: false,

    capitalEth:
      numberEnv(
        "AUTOPILOT_CAPITAL_ETH",
        1,
      ),

    maxTradeEth:
      numberEnv(
        "AUTOPILOT_MAX_TRADE_ETH",
        0.1,
      ),

    maxPositions:
      numberEnv(
        "AUTOPILOT_MAX_POSITIONS",
        5,
      ),

    minScore:
      numberEnv(
        "AUTOPILOT_MIN_SCORE",
        75,
      ),

    maxRisk:
      numberEnv(
        "AUTOPILOT_MAX_RISK",
        35,
      ),

    minLiquidity:
      numberEnv(
        "AUTOPILOT_MIN_LIQUIDITY",
        25_000,
      ),

    slippage:
      numberEnv(
        "AUTOPILOT_SLIPPAGE",
        1,
      ),

    stopLossPercent:
      numberEnv(
        "AUTOPILOT_STOP_LOSS",
        15,
      ),

    trailingStopPercent:
      numberEnv(
        "AUTOPILOT_TRAILING_STOP",
        8,
      ),

    takeProfitLevels: [
      25,
      50,
      100,
    ],

    requireSimulation: true,

    requireSmartMoney: false,

    maxDailyLossPercent:
      numberEnv(
        "AUTOPILOT_MAX_DAILY_LOSS",
        10,
      ),

    cooldownSeconds:
      numberEnv(
        "AUTOPILOT_COOLDOWN",
        30,
      ),
  };
}

export function getAutopilotConfig(
  userId: number,
): AutopilotConfig {
  let config =
    autopilotConfigs.get(
      userId,
    );

  if (!config) {
    config =
      createDefaultConfig();

    autopilotConfigs.set(
      userId,
      config,
    );
  }

  return {
    ...config,

    takeProfitLevels: [
      ...config.takeProfitLevels,
    ],
  };
}

export function setAutopilotConfig(
  userId: number,
  updates: Partial<AutopilotConfig>,
): AutopilotConfig {
  const current =
    getAutopilotConfig(userId);

  const updated: AutopilotConfig =
    {
      ...current,
      ...updates,

      capitalEth:
        Number(
          updates.capitalEth ??
            current.capitalEth,
        ),

      maxTradeEth:
        Number(
          updates.maxTradeEth ??
            current.maxTradeEth,
        ),

      maxPositions:
        Number(
          updates.maxPositions ??
            current.maxPositions,
        ),

      minScore:
        Number(
          updates.minScore ??
            current.minScore,
        ),

      maxRisk:
        Number(
          updates.maxRisk ??
            current.maxRisk,
        ),

      minLiquidity:
        Number(
          updates.minLiquidity ??
            current.minLiquidity,
        ),

      slippage:
        Number(
          updates.slippage ??
            current.slippage ??
            1,
        ),

      stopLossPercent:
        Number(
          updates.stopLossPercent ??
            current.stopLossPercent,
        ),

      trailingStopPercent:
        Number(
          updates.trailingStopPercent ??
            current.trailingStopPercent,
        ),

      takeProfitLevels:
        updates.takeProfitLevels ??
        current.takeProfitLevels,

      requireSimulation:
        updates.requireSimulation ??
        current.requireSimulation,

      requireSmartMoney:
        updates.requireSmartMoney ??
        current.requireSmartMoney,

      maxDailyLossPercent:
        Number(
          updates.maxDailyLossPercent ??
            current.maxDailyLossPercent ??
            10,
        ),

      cooldownSeconds:
        Number(
          updates.cooldownSeconds ??
            current.cooldownSeconds ??
            30,
        ),
    };

  autopilotConfigs.set(
    userId,
    updated,
  );

  return updated;
}

export function startAutopilot(
  userId: number,
): AutopilotConfig {
  return setAutopilotConfig(
    userId,
    {
      enabled: true,
    },
  );
}

export function stopAutopilot(
  userId: number,
): AutopilotConfig {
  return setAutopilotConfig(
    userId,
    {
      enabled: false,
    },
  );
}

export function isAutopilotEnabled(
  userId: number,
): boolean {
  return getAutopilotConfig(
    userId,
  ).enabled;
}

export function canAutopilotTrade(
  userId: number,
  tokenScore: number,
  riskScore: number,
  liquidity: number,
): boolean {
  const config =
    getAutopilotConfig(userId);

  if (!config.enabled) {
    return false;
  }

  if (
    tokenScore <
    config.minScore
  ) {
    return false;
  }

  if (
    riskScore >
    config.maxRisk
  ) {
    return false;
  }

  if (
    liquidity <
    config.minLiquidity
  ) {
    return false;
  }

  return true;
}

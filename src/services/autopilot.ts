import {
  AutopilotConfig,
} from "../types";

const configs =
  new Map<
    number,
    AutopilotConfig
  >();

function envNumber(
  name: string,
  fallback: number,
): number {
  const value =
    process.env[name];

  if (
    value === undefined ||
    value === ""
  ) {
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

function defaultConfig(): AutopilotConfig {
  return {
    enabled: false,

    capitalEth:
      envNumber(
        "AUTOPILOT_CAPITAL_ETH",
        1,
      ),

    maxTradeEth:
      envNumber(
        "AUTOPILOT_MAX_TRADE_ETH",
        0.1,
      ),

    maxPositions:
      envNumber(
        "AUTOPILOT_MAX_POSITIONS",
        5,
      ),

    minScore:
      envNumber(
        "AUTOPILOT_MIN_SCORE",
        75,
      ),

    maxRisk:
      envNumber(
        "AUTOPILOT_MAX_RISK",
        35,
      ),

    minLiquidity:
      envNumber(
        "AUTOPILOT_MIN_LIQUIDITY",
        25_000,
      ),

    slippage:
      envNumber(
        "AUTOPILOT_SLIPPAGE",
        1,
      ),

    stopLossPercent:
      envNumber(
        "AUTOPILOT_STOP_LOSS",
        15,
      ),

    trailingStopPercent:
      envNumber(
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
      envNumber(
        "AUTOPILOT_MAX_DAILY_LOSS",
        10,
      ),

    cooldownSeconds:
      envNumber(
        "AUTOPILOT_COOLDOWN",
        30,
      ),
  };
}

export function getAutopilotConfig(
  userId: number,
): AutopilotConfig {
  const existing =
    configs.get(userId);

  if (existing) {
    return {
      ...existing,
      takeProfitLevels: [
        ...existing.takeProfitLevels,
      ],
    };
  }

  const created =
    defaultConfig();

  configs.set(
    userId,
    created,
  );

  return {
    ...created,
    takeProfitLevels: [
      ...created.takeProfitLevels,
    ],
  };
}

export function setAutopilotConfig(
  userId: number,
  updates: Partial<AutopilotConfig>,
): AutopilotConfig {
  const current =
    getAutopilotConfig(userId);

  const updated: AutopilotConfig = {
    enabled:
      updates.enabled ??
      current.enabled,

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

  configs.set(
    userId,
    updated,
  );

  return {
    ...updated,
    takeProfitLevels: [
      ...updated.takeProfitLevels,
    ],
  };
}

export function enableAutopilot(
  userId: number,
): AutopilotConfig {
  return setAutopilotConfig(
    userId,
    {
      enabled: true,
    },
  );
}

export function disableAutopilot(
  userId: number,
): AutopilotConfig {
  return setAutopilotConfig(
    userId,
    {
      enabled: false,
    },
  );
}

export const startAutopilot =
  enableAutopilot;

export const stopAutopilot =
  disableAutopilot;

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

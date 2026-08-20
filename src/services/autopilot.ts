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

  return Number.isFinite(parsed)
    ? parsed
    : fallback;
}

function cloneConfig(
  config: AutopilotConfig,
): AutopilotConfig {
  return {
    ...config,

    takeProfitLevels: [
      ...config.takeProfitLevels,
    ],
  };
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
    return cloneConfig(
      existing,
    );
  }

  const created =
    defaultConfig();

  configs.set(
    userId,
    created,
  );

  return cloneConfig(
    created,
  );
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
        current.slippage,
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
      Array.isArray(
        updates.takeProfitLevels,
      )
        ? updates.takeProfitLevels.map(
            Number,
          )
        : [
            ...current.takeProfitLevels,
          ],

    requireSimulation:
      updates.requireSimulation ??
      current.requireSimulation,

    requireSmartMoney:
      updates.requireSmartMoney ??
      current.requireSmartMoney,

    maxDailyLossPercent:
      Number(
        updates.maxDailyLossPercent ??
        current.maxDailyLossPercent,
      ),

    cooldownSeconds:
      Number(
        updates.cooldownSeconds ??
        current.cooldownSeconds,
      ),
  };

  configs.set(
    userId,
    updated,
  );

  return cloneConfig(
    updated,
  );
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

export function resetAutopilotConfig(
  userId: number,
): AutopilotConfig {
  const config =
    defaultConfig();

  configs.set(
    userId,
    config,
  );

  return cloneConfig(
    config,
  );
}

export function removeAutopilotConfig(
  userId: number,
): boolean {
  return configs.delete(
    userId,
  );
}

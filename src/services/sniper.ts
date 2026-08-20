import {
  SniperConfig,
} from "../types";

const sniperConfigs =
  new Map<number, SniperConfig>();

function numberEnv(
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

function defaultSniperConfig(): SniperConfig {
  return {
    enabled: false,

    minScore:
      numberEnv(
        "SNIPER_MIN_SCORE",
        80,
      ),

    maxRisk:
      numberEnv(
        "SNIPER_MAX_RISK",
        30,
      ),

    minLiquidity:
      numberEnv(
        "SNIPER_MIN_LIQUIDITY",
        25_000,
      ),

    maxMarketCap:
      numberEnv(
        "SNIPER_MAX_MARKET_CAP",
        5_000_000,
      ),

    maxBuyEth:
      numberEnv(
        "SNIPER_MAX_BUY_ETH",
        0.1,
      ),

    slippage:
      numberEnv(
        "SNIPER_SLIPPAGE",
        1,
      ),

    maxGasEth:
      numberEnv(
        "SNIPER_MAX_GAS_ETH",
        0.01,
      ),

    requireSimulation: true,

    requireSmartMoney: false,

    autoSell: false,

    stopLossPercent:
      numberEnv(
        "SNIPER_STOP_LOSS",
        15,
      ),

    takeProfitPercent:
      numberEnv(
        "SNIPER_TAKE_PROFIT",
        50,
      ),
  };
}

export function getSniperConfig(
  userId: number,
): SniperConfig {
  const config =
    sniperConfigs.get(userId);

  if (config) {
    return {
      ...config,
    };
  }

  const created =
    defaultSniperConfig();

  sniperConfigs.set(
    userId,
    created,
  );

  return {
    ...created,
  };
}

export function setSniperConfig(
  userId: number,
  updates: Partial<SniperConfig>,
): SniperConfig {
  const current =
    getSniperConfig(userId);

  const updated: SniperConfig = {
    enabled:
      updates.enabled ??
      current.enabled,

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

    maxMarketCap:
      Number(
        updates.maxMarketCap ??
        current.maxMarketCap,
      ),

    maxBuyEth:
      Number(
        updates.maxBuyEth ??
        current.maxBuyEth,
      ),

    slippage:
      Number(
        updates.slippage ??
        current.slippage,
      ),

    maxGasEth:
      Number(
        updates.maxGasEth ??
        current.maxGasEth,
      ),

    requireSimulation:
      updates.requireSimulation ??
      current.requireSimulation,

    requireSmartMoney:
      updates.requireSmartMoney ??
      current.requireSmartMoney,

    autoSell:
      updates.autoSell ??
      current.autoSell,

    stopLossPercent:
      Number(
        updates.stopLossPercent ??
        current.stopLossPercent,
      ),

    takeProfitPercent:
      Number(
        updates.takeProfitPercent ??
        current.takeProfitPercent,
      ),
  };

  sniperConfigs.set(
    userId,
    updated,
  );

  return {
    ...updated,
  };
}

export function startSniper(
  userId: number,
): SniperConfig {
  return setSniperConfig(
    userId,
    {
      enabled: true,
    },
  );
}

export function stopSniper(
  userId: number,
): SniperConfig {
  return setSniperConfig(
    userId,
    {
      enabled: false,
    },
  );
}

export function isSniperEnabled(
  userId: number,
): boolean {
  return getSniperConfig(
    userId,
  ).enabled;
}

export function canSniperTrade(
  userId: number,
  score: number,
  risk: number,
  liquidity: number,
  marketCap: number,
): boolean {
  return checkSniperTrade(
    userId,
    score,
    risk,
    liquidity,
    marketCap,
  ).allowed;
}

export interface SniperCheckResult {
  allowed: boolean;
  reasons: string[];
}

export function checkSniperTrade(
  userId: number,
  score: number,
  risk: number,
  liquidity: number,
  marketCap: number,
): SniperCheckResult {
  const config =
    getSniperConfig(userId);

  const reasons: string[] = [];

  if (!config.enabled) {
    reasons.push(
      "Sniper is disabled",
    );
  }

  if (
    score <
    config.minScore
  ) {
    reasons.push(
      `Score ${score} is below minimum ${config.minScore}`,
    );
  }

  if (
    risk >
    config.maxRisk
  ) {
    reasons.push(
      `Risk ${risk} exceeds maximum ${config.maxRisk}`,
    );
  }

  if (
    liquidity <
    config.minLiquidity
  ) {
    reasons.push(
      `Liquidity is below ${config.minLiquidity}`,
    );
  }

  if (
    marketCap >
    config.maxMarketCap
  ) {
    reasons.push(
      `Market cap exceeds ${config.maxMarketCap}`,
    );
  }

  return {
    allowed:
      reasons.length === 0,

    reasons,
  };
}

export function resetSniperConfig(
  userId: number,
): SniperConfig {
  const config =
    defaultSniperConfig();

  sniperConfigs.set(
    userId,
    config,
  );

  return {
    ...config,
  };
}

export function removeSniperConfig(
  userId: number,
): boolean {
  return sniperConfigs.delete(
    userId,
  );
}

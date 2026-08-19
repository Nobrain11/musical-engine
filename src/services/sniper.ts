// src/services/sniper.ts

import {
  SniperConfig,
} from "../types";

const sniperConfigs =
  new Map<
    number,
    SniperConfig
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

    stopLossPercent: 15,

    takeProfitPercent: 50,
  };
}

export function getSniperConfig(
  userId: number,
): SniperConfig {
  let config =
    sniperConfigs.get(
      userId,
    );

  if (!config) {
    config =
      defaultSniperConfig();

    sniperConfigs.set(
      userId,
      config,
    );
  }

  return {
    ...config,
  };
}

export function setSniperConfig(
  userId: number,
  updates: Partial<SniperConfig>,
): SniperConfig {
  const current =
    getSniperConfig(userId);

  const updated: SniperConfig =
    {
      ...current,
      ...updates,

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
            current.maxGasEth ??
            0.01,
        ),

      stopLossPercent:
        Number(
          updates.stopLossPercent ??
            current.stopLossPercent ??
            15,
        ),

      takeProfitPercent:
        Number(
          updates.takeProfitPercent ??
            current.takeProfitPercent ??
            50,
        ),
    };

  sniperConfigs.set(
    userId,
    updated,
  );

  return updated;
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
  const config =
    getSniperConfig(userId);

  if (!config.enabled) {
    return false;
  }

  if (
    score <
    config.minScore
  ) {
    return false;
  }

  if (
    risk >
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

  if (
    marketCap >
    config.maxMarketCap
  ) {
    return false;
  }

  return true;
}

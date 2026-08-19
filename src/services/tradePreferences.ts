import {
  TradePreferences,
} from "../types";

const preferences =
  new Map<number, TradePreferences>();

function defaults(
  userId: number,
): TradePreferences {
  return {
    userId,

    activeWalletId:
      undefined,

    defaultBuyEth:
      "0.10",

    defaultSellPercent:
      100,

    slippage:
      0.50,

    gasMode:
      "AUTO",

    mevProtection:
      true,

    confirmationMode:
      "ALWAYS",

    updatedAt:
      Date.now(),
  };
}

export function getTradePreferences(
  userId: number,
): TradePreferences {
  const existing =
    preferences.get(userId);

  if (existing) {
    return {
      ...existing,
    };
  }

  const created =
    defaults(userId);

  preferences.set(
    userId,
    created,
  );

  return {
    ...created,
  };
}

export function updateTradePreferences(
  userId: number,
  updates: Partial<
    Omit<
      TradePreferences,
      "userId" | "updatedAt"
    >
  >,
): TradePreferences {
  const current =
    getTradePreferences(userId);

  const next: TradePreferences = {
    ...current,
    ...updates,
    userId,
    updatedAt:
      Date.now(),
  };

  validateTradePreferences(
    next,
  );

  preferences.set(
    userId,
    next,
  );

  return {
    ...next,
  };
}

export function setActiveTradeWallet(
  userId: number,
  walletId: string,
): TradePreferences {
  return updateTradePreferences(
    userId,
    {
      activeWalletId:
        walletId,
    },
  );
}

export function setDefaultBuyAmount(
  userId: number,
  amountEth: string,
): TradePreferences {
  const amount =
    Number(amountEth);

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    throw new Error(
      "Invalid buy amount",
    );
  }

  return updateTradePreferences(
    userId,
    {
      defaultBuyEth:
        amountEth,
    },
  );
}

export function setDefaultSellPercent(
  userId: number,
  percent: number,
): TradePreferences {
  if (
    !Number.isFinite(percent) ||
    percent < 1 ||
    percent > 100
  ) {
    throw new Error(
      "Sell percentage must be between 1 and 100",
    );
  }

  return updateTradePreferences(
    userId,
    {
      defaultSellPercent:
        percent,
    },
  );
}

export function setSlippage(
  userId: number,
  slippage: number,
): TradePreferences {
  if (
    !Number.isFinite(slippage) ||
    slippage < 0 ||
    slippage > 50
  ) {
    throw new Error(
      "Slippage must be between 0 and 50%",
    );
  }

  return updateTradePreferences(
    userId,
    {
      slippage,
    },
  );
}

export function setGasMode(
  userId: number,
  gasMode:
    | "AUTO"
    | "FAST"
    | "CUSTOM",
): TradePreferences {
  return updateTradePreferences(
    userId,
    {
      gasMode,
    },
  );
}

export function setMevProtection(
  userId: number,
  enabled: boolean,
): TradePreferences {
  return updateTradePreferences(
    userId,
    {
      mevProtection:
        enabled,
    },
  );
}

export function setConfirmationMode(
  userId: number,
  mode:
    | "ALWAYS"
    | "SMART"
    | "OFF",
): TradePreferences {
  return updateTradePreferences(
    userId,
    {
      confirmationMode:
        mode,
    },
  );
}

export function resetTradePreferences(
  userId: number,
): TradePreferences {
  const reset =
    defaults(userId);

  preferences.set(
    userId,
    reset,
  );

  return {
    ...reset,
  };
}

function validateTradePreferences(
  value: TradePreferences,
): void {
  const buy =
    Number(value.defaultBuyEth);

  if (
    !Number.isFinite(buy) ||
    buy <= 0
  ) {
    throw new Error(
      "Invalid default buy amount",
    );
  }

  if (
    !Number.isFinite(
      value.defaultSellPercent,
    ) ||
    value.defaultSellPercent < 1 ||
    value.defaultSellPercent > 100
  ) {
    throw new Error(
      "Invalid default sell percentage",
    );
  }

  if (
    !Number.isFinite(
      value.slippage,
    ) ||
    value.slippage < 0 ||
    value.slippage > 50
  ) {
    throw new Error(
      "Invalid slippage",
    );
  }

  if (
    ![
      "AUTO",
      "FAST",
      "CUSTOM",
    ].includes(value.gasMode)
  ) {
    throw new Error(
      "Invalid gas mode",
    );
  }

  if (
    ![
      "ALWAYS",
      "SMART",
      "OFF",
    ].includes(
      value.confirmationMode,
    )
  ) {
    throw new Error(
      "Invalid confirmation mode",
    );
  }
}

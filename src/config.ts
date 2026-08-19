import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export const config = {
  telegram: {
    token: required("TELEGRAM_BOT_TOKEN"),
  },

  robinhood: {
    rpcUrl: required("ROBINHOOD_RPC_URL"),
    chainId: Number(
      required("ROBINHOOD_CHAIN_ID"),
    ),
  },

  trading: {
    defaultSlippage: Number(
      process.env.DEFAULT_SLIPPAGE || "0.5",
    ),

    defaultBuyAmount:
      process.env.DEFAULT_BUY_AMOUNT || "0.10",

    maxTradeAmount:
      process.env.MAX_TRADE_AMOUNT || "0.50",

    priorityFee:
      process.env.PRIORITY_FEE || "fast",
  },

  security: {
    encryptionKey:
      process.env.WALLET_ENCRYPTION_KEY || "",
  },

  app: {
    environment:
      process.env.NODE_ENV || "development",
  },
};

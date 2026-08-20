export type WalletSource =
  | "GENERATED"
  | "PRIVATE_KEY"
  | "SEED_PHRASE";

export interface WalletCredentials {
  privateKey: string;
  mnemonic?: string;
}

export interface StoredWallet {
  id: string;
  userId: number;
  name: string;
  address: string;
  encryptedPrivateKey: string;
  encryptedMnemonic: string | null;
  source: WalletSource;
  createdAt: number;
  updatedAt: number;
}

export interface CreatedWallet {
  wallet: StoredWallet;
  credentials: WalletCredentials;

  // Compatibility fields used by older bot code.
  address: string;
  privateKey: string;
  mnemonic?: string;
}

export type TradeSide =
  | "BUY"
  | "SELL";

export type TradeStatus =
  | "PENDING"
  | "CONFIRMING"
  | "EXECUTING"
  | "CONFIRMED"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"
  | "EXPIRED";

export type OrderType =
  | "MARKET"
  | "LIMIT"
  | "STOP_LOSS"
  | "TAKE_PROFIT";

export interface PendingTrade {
  userId: number;
  tokenAddress: string;
  symbol: string;
  side: TradeSide;
  amountEth: string;
  slippage: number;
  expiresAt: number;
}

export interface ConfirmationTrade {
  userId: number;
  tokenAddress: string;
  symbol: string;
  side: TradeSide;
  amountEth: string;
  slippage: number;
  expiresAt: number;
}

export interface Token {
  address: string;
  symbol: string;
  name?: string;

  chainId?: string;
  decimals?: number;

  priceUsd?: number;
  marketCap?: number;
  liquidity?: number;
  volume24h?: number;

  score?: number;
  risk?: number;

  buyPressure?: number;
}

export interface Order {
  id: string;
  userId: number;
  tokenAddress: string;
  symbol?: string;

  side: TradeSide;
  type: OrderType;

  amountEth?: number;
  price?: number;

  stopPrice?: number;
  limitPrice?: number;

  status: TradeStatus;

  createdAt: number;
  updatedAt: number;
  expiresAt?: number;

  txHash?: string;
}

export interface Position {
  id: string;
  userId: number;

  tokenAddress: string;
  symbol: string;

  amount: string;
  entryPrice: number;
  currentPrice?: number;

  pnl?: number;
  pnlPercent?: number;

  openedAt: number;
  updatedAt: number;
}

export interface AutopilotConfig {
  enabled: boolean;

  capitalEth: number;
  maxTradeEth: number;
  maxPositions: number;

  minScore: number;
  maxRisk: number;
  minLiquidity: number;

  slippage: number;

  stopLossPercent: number;
  trailingStopPercent: number;

  takeProfitLevels: number[];

  requireSimulation: boolean;
  requireSmartMoney: boolean;

  maxDailyLossPercent: number;
  cooldownSeconds: number;
}

export interface SniperConfig {
  enabled: boolean;

  minScore: number;
  maxRisk: number;
  minLiquidity: number;
  maxMarketCap: number;

  maxBuyEth: number;

  slippage: number;
  maxGasEth: number;

  requireSimulation: boolean;
  requireSmartMoney: boolean;

  autoSell: boolean;

  stopLossPercent: number;
  takeProfitPercent: number;
}

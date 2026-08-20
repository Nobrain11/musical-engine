// src/types.ts

/*
|--------------------------------------------------------------------------
| Wallet
|--------------------------------------------------------------------------
*/

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

  /*
   * Compatibility fields used by
   * existing Telegram bot code.
   */
  address: string;
  privateKey: string;
  mnemonic?: string;
}

export interface UserWalletState {
  userId: number;

  wallets: StoredWallet[];

  activeWalletId?: string;

  updatedAt: number;
}

/*
|--------------------------------------------------------------------------
| Trading
|--------------------------------------------------------------------------
*/

export type TradeSide =
  | "BUY"
  | "SELL";

export type TradeStatus =
  | "OPEN"
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

/*
|--------------------------------------------------------------------------
| Pending / Confirmation Trade
|--------------------------------------------------------------------------
*/

export interface PendingTrade {
  userId: number;

  tokenAddress: string;
  symbol: string;

  side: TradeSide;

  amountEth: string;

  slippage: number;

  expiresAt: number;
}

export interface TradePreferences {
  userId: number;
  activeWalletId?: string;
  defaultBuyEth: string;
  defaultSellPercent: number;
  slippage: number;
  gasMode: "AUTO" | "FAST" | "CUSTOM";
  mevProtection: boolean;
  confirmationMode: "ALWAYS" | "SMART" | "OFF";
  updatedAt: number;
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

/*
|--------------------------------------------------------------------------
| Token
|--------------------------------------------------------------------------
|
| This interface intentionally contains both the original market-data
| fields and the scoring fields used by scanner/tradeGuard.
|--------------------------------------------------------------------------
*/

export interface Token {
  address: string;

  symbol: string;

  name?: string;

  chainId?: string;

  decimals?: number;

  /*
   * Market data
   */

  priceUsd?: number;

  /** Compatibility alias used by bot presentation and market helpers. */
  price?: number;

  marketCap?: number;

  liquidity: number;

  volume24h?: number;

  /*
   * General score
   */

  score?: number;

  risk?: number;

  /*
   * Risk engine
   */

  riskScore: number;

  /*
   * Momentum engine
   */

  momentumScore: number;

  /*
   * Smart money engine
   */

  smartMoneyScore: number;

  /*
   * Liquidity engine
   */

  liquidityScore: number;

  /*
   * Buy pressure
   */

  buyPressure: number;

  /*
   * Optional trading metadata
   */

  priceChange24h?: number;

  volumeChange24h?: number;

  txCount24h?: number;

  buys24h?: number;

  sells24h?: number;

  holders?: number;

  ageSeconds?: number;

  pairAddress?: string;

  quoteAddress?: string;

  dexId?: string;

  pairCreatedAt?: number;

  /*
   * Token lifecycle
   *
   * Used by the Robinhood execution layer to decide
   * whether a token is still on the bonding curve or
   * has graduated to the Uniswap V4 route.
   */

  migrated?: boolean;

  graduated?: boolean;

  /*
   * Optional contract security information.
   */

  verified?: boolean;

  renounced?: boolean;

  honeypot?: boolean;

  mintAuthority?: string | null;

  freezeAuthority?: string | null;
}

/*
|--------------------------------------------------------------------------
| Orders
|--------------------------------------------------------------------------
*/

export interface Order {
  id: string;

  userId: number;

  tokenAddress: string;

  symbol?: string;

  side: TradeSide;

  type: OrderType;

  /*
   * Primary amount used by the current order service.
   *
   * Kept as string because ETH/token amounts should not
   * be represented as floating point values internally.
   */

  amount: string;

  /*
   * Compatibility field for code that expects amountEth.
   */

  amountEth?: number;

  /*
   * Price fields
   */

  price?: number;

  stopPrice?: number;

  limitPrice?: number;

  /*
   * Order lifecycle
   */

  status: TradeStatus;

  createdAt: number;

  updatedAt: number;

  expiresAt?: number;

  txHash?: string;
}

/*
|--------------------------------------------------------------------------
| Positions
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Autopilot
|--------------------------------------------------------------------------
*/

export interface AutopilotConfig {
  enabled: boolean;

  capitalEth: number;

  maxTradeEth: number;

  maxPositions: number;

  /*
   * Token filters
   */

  minScore: number;

  maxRisk: number;

  minLiquidity: number;

  /*
   * Execution
   */

  slippage: number;

  /*
   * Exit strategy
   */

  stopLossPercent: number;

  trailingStopPercent: number;

  takeProfitLevels: number[];

  /*
   * Safety
   */

  requireSimulation: boolean;

  requireSmartMoney: boolean;

  /*
   * Risk limits
   */

  maxDailyLossPercent: number;

  cooldownSeconds: number;
}

/*
|--------------------------------------------------------------------------
| Sniper
|--------------------------------------------------------------------------
*/

export interface SniperConfig {
  enabled: boolean;

  /*
   * Token filters
   */

  minScore: number;

  maxRisk: number;

  minLiquidity: number;

  maxMarketCap: number;

  /*
   * Buy limits
   */

  maxBuyEth: number;

  /*
   * Execution
   */

  slippage: number;

  maxGasEth: number;

  /*
   * Safety
   */

  requireSimulation: boolean;

  requireSmartMoney: boolean;

  /*
   * Auto sell
   */

  autoSell: boolean;

  stopLossPercent: number;

  takeProfitPercent: number;
}

/*
|--------------------------------------------------------------------------
| Scanner
|--------------------------------------------------------------------------
*/

export interface ScanResult {
  token: Token;

  score: number;

  reasons: string[];
}

/*
|--------------------------------------------------------------------------
| Trade Guard
|--------------------------------------------------------------------------
*/

export interface TradeRequest {
  side: TradeSide;

  token: Token;

  amountEth: number;

  slippage: number;
}

export interface TradeGuardResult {
  approved: boolean;

  score: number;

  reasons: string[];

  warnings: string[];
}

/*
|--------------------------------------------------------------------------
| Simulation
|--------------------------------------------------------------------------
*/

export interface SimulationResult {
  success: boolean;

  gasUsed?: string;

  error?: string;

  reason?: string;

  returnData?: string;
}

/*
|--------------------------------------------------------------------------
| Execution
|--------------------------------------------------------------------------
*/

export interface ExecutionResult {
  success: boolean;

  txHash?: string;

  guard: TradeGuardResult;

  error?: string;
}

/*
|--------------------------------------------------------------------------
| Market Data
|--------------------------------------------------------------------------
*/

export interface MarketData {
  tokenAddress: string;

  priceUsd: number;

  marketCap: number;

  liquidity: number;

  volume24h: number;

  priceChange24h?: number;

  volumeChange24h?: number;

  buys24h?: number;

  sells24h?: number;

  buyPressure?: number;
}

/*
|--------------------------------------------------------------------------
| Token Risk
|--------------------------------------------------------------------------
*/

export interface TokenRisk {
  score: number;

  reasons: string[];

  warnings: string[];

  honeypot?: boolean;

  mintable?: boolean;

  freezable?: boolean;

  liquidityLocked?: boolean;

  contractVerified?: boolean;
}

/*
|--------------------------------------------------------------------------
| Smart Money
|--------------------------------------------------------------------------
*/

export interface SmartMoneyData {
  score: number;

  wallets: string[];

  inflowEth?: number;

  outflowEth?: number;

  netFlowEth?: number;
}

/*
|--------------------------------------------------------------------------
| Sniper Check
|--------------------------------------------------------------------------
*/

export interface SniperCheckResult {
  allowed: boolean;

  reasons: string[];
}

/*
|--------------------------------------------------------------------------
| Autopilot Check
|--------------------------------------------------------------------------
*/

export interface AutopilotCheckResult {
  allowed: boolean;

  reasons: string[];
}

/*
|--------------------------------------------------------------------------
| Trade Confirmation
|--------------------------------------------------------------------------
*/

export interface TradeConfirmation {
  userId: number;

  tokenAddress: string;

  symbol: string;

  side: TradeSide;

  amountEth: string;

  slippage: number;

  createdAt: number;

  expiresAt: number;
}

/*
|--------------------------------------------------------------------------
| ERROR404 — Shared Types
|--------------------------------------------------------------------------
*/

export type TradeSide =
  | "BUY"
  | "SELL";

export type TradeStatus =
  | "PENDING"
  | "OPEN"
  | "FILLED"
  | "PARTIAL"
  | "CANCELLED"
  | "FAILED"
  | "EXPIRED";

export type OrderType =
  | "MARKET"
  | "LIMIT"
  | "STOP"
  | "STOP_LIMIT";

export type WalletSource =
  | "GENERATED"
  | "PRIVATE_KEY"
  | "SEED_PHRASE";

/*
|--------------------------------------------------------------------------
| TOKEN
|--------------------------------------------------------------------------
*/

export interface Token {
  address: string;
  symbol: string;
  name: string;

  chain?: string;
  chainId?: string | number;

  price: number;
  marketCap: number;
  liquidity: number;
  volume24h: number;

  momentumScore: number;
  smartMoneyScore: number;
  liquidityScore: number;
  riskScore: number;

  priceChange24h?: number;

  pairAddress?: string;
  quoteAddress?: string;

  decimals?: number;

  migrated?: boolean;

  createdAt?: number;
}

/*
|--------------------------------------------------------------------------
| WALLET
|--------------------------------------------------------------------------
*/

export interface StoredWallet {
  id: string;
  userId: number;

  name: string;
  address: string;

  encryptedPrivateKey: string;
  encryptedMnemonic?: string | null;

  source: WalletSource;

  createdAt: number;
  updatedAt: number;
}

export interface WalletSummary {
  id: string;
  name: string;
  address: string;
  source: WalletSource;
  active: boolean;
  createdAt: number;
}

export interface WalletCredentials {
  privateKey: string;
  mnemonic?: string;
}

export interface CreatedWallet {
  wallet: StoredWallet;
  credentials: WalletCredentials;

  /*
   * Compatibility with the previous wallet API.
   */
  address: string;
  privateKey?: string;
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
| TRADING
|--------------------------------------------------------------------------
*/

export interface Order {
  id: string;

  userId: number;

  tokenAddress: string;
  symbol: string;

  side: TradeSide;
  type: OrderType;

  amount: string;
  amountEth?: string;

  price?: number;
  limitPrice?: number;
  stopPrice?: number;

  status: TradeStatus;

  txHash?: string;

  createdAt: number;
  updatedAt?: number;

  filledAt?: number;
}

/*
|--------------------------------------------------------------------------
| POSITION
|--------------------------------------------------------------------------
*/

export interface Position {
  id?: string;

  userId?: number;

  tokenAddress?: string;

  symbol: string;

  entryPrice: number;
  currentPrice: number;

  amount?: string;
  tokenAmount?: string;

  investedEth?: number;
  currentValueEth?: number;

  pnl?: number;
  pnlPercent: number;

  openedAt?: number;
  updatedAt?: number;
}

/*
|--------------------------------------------------------------------------
| CONFIRMATION / PENDING TRADE
|--------------------------------------------------------------------------
*/

export interface PendingTrade {
  id?: string;

  userId: number;

  tokenAddress: string;

  symbol: string;

  side: TradeSide;

  amountEth: string;

  slippage: number;

  expiresAt: number;

  createdAt?: number;

  walletId?: string;

  walletAddress?: string;

  price?: number;

  quoteAmount?: string;

  riskScore?: number;

  status?: TradeStatus;
}

/*
 * Older confirmation code uses the name ConfirmationTrade.
 * Keep both names compatible.
 */
export interface ConfirmationTrade {
  id?: string;

  userId: number;

  tokenAddress: string;

  symbol: string;

  side: TradeSide;

  amountEth: string;

  slippage: number;

  expiresAt: number;

  createdAt?: number;

  walletId?: string;

  walletAddress?: string;
}

/*
|--------------------------------------------------------------------------
| AUTOPILOT
|--------------------------------------------------------------------------
*/

export interface AutopilotConfig {
  enabled: boolean;

  capitalEth: number;

  maxTradeEth: number;

  maxPositions: number;

  minScore: number;

  maxRisk: number;

  minLiquidity: number;

  stopLossPercent: number;

  trailingStopPercent: number;

  takeProfitLevels: number[];
}

/*
|--------------------------------------------------------------------------
| SNIPER
|--------------------------------------------------------------------------
*/

export interface SniperConfig {
  enabled: boolean;

  minLiquidity: number;

  maxMarketCap: number;

  minScore: number;

  maxRisk: number;

  maxBuyEth: string;

  maxPositions?: number;

  slippage: number;
}

/*
|--------------------------------------------------------------------------
| TRADE PREFERENCES
|--------------------------------------------------------------------------
*/

export interface TradePreferences {
  userId: number;

  activeWalletId?: string;

  defaultBuyEth: string;

  defaultSellPercent: number;

  slippage: number;

  gasMode:
    | "AUTO"
    | "FAST"
    | "CUSTOM";

  mevProtection: boolean;

  confirmationMode:
    | "ALWAYS"
    | "SMART"
    | "OFF";

  updatedAt: number;
}

/*
|--------------------------------------------------------------------------
| SMART MONEY
|--------------------------------------------------------------------------
*/

export interface SmartMoneyWallet {
  address: string;

  label?: string;

  addedAt?: number;

  enabled?: boolean;
}

/*
|--------------------------------------------------------------------------
| ALERTS
|--------------------------------------------------------------------------
*/

export interface AlertSubscription {
  userId: number;

  enabled: boolean;

  momentum?: boolean;
  smartMoney?: boolean;
  liquidity?: boolean;
  risk?: boolean;
  trading?: boolean;

  createdAt?: number;
  updatedAt?: number;
}

/*
|--------------------------------------------------------------------------
| ANALYSIS
|--------------------------------------------------------------------------
*/

export interface TokenAnalysis {
  tokenAddress: string;

  score: number;

  momentumScore?: number;
  smartMoneyScore?: number;
  liquidityScore?: number;
  riskScore?: number;

  tradeable?: boolean;

  reasons?: string[];

  createdAt?: number;
}

/*
|--------------------------------------------------------------------------
| EXECUTION
|--------------------------------------------------------------------------
*/

export interface TradeQuote {
  tokenAddress: string;

  side: TradeSide;

  amountEth: string;

  expectedTokenAmount?: string;

  expectedPrice?: number;

  priceImpact?: number;

  slippage: number;

  route?: string;

  estimatedGas?: string;
}

export interface ExecutionResult {
  success: boolean;

  txHash?: string;

  error?: string;

  tokenAmount?: string;

  amountEth?: string;

  price?: number;

  gasUsed?: string;
}

/*
|--------------------------------------------------------------------------
| TRANSFER
|--------------------------------------------------------------------------
*/

export interface TransferRequest {
  userId: number;

  walletId: string;

  recipient: string;

  amountEth: string;

  gasLimit?: string;

  gasPrice?: string;
}

export interface TransferResult {
  success: boolean;

  txHash?: string;

  error?: string;

  amountEth?: string;

  recipient?: string;
}

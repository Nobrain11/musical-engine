// src/types.ts

export interface Wallet {
  userId: number;
  address: string;
  encryptedPrivateKey: string;
}

export interface Token {
  address: string;
  name: string;
  symbol: string;
  decimals: number;

  price: number;

  marketCap: number;
  liquidity: number;
  volume24h: number;

  priceChange5m: number;
  priceChange1h: number;
  priceChange6h: number;
  priceChange24h: number;

  buyPressure: number;

  momentumScore: number;
  smartMoneyScore: number;
  liquidityScore: number;

  riskScore: number;

  holders?: number;
  transactions24h?: number;

  pairAddress?: string;
  dex?: string;

  createdAt?: number;

  migrated?: boolean;
}

export interface TokenAnalysis {
  token: Token;

  score: number;

  momentum: number;
  liquidity: number;
  smartMoney: number;
  risk: number;

  approved: boolean;

  reasons: string[];
  warnings: string[];

  timestamp: number;
}

export type TradeSide =
  | "BUY"
  | "SELL";

export type TradeStatus =
  | "OPEN"
  | "PENDING"
  | "SIMULATING"
  | "APPROVED"
  | "REJECTED"
  | "SIGNING"
  | "BROADCASTING"
  | "CONFIRMED"
  | "FAILED"
  | "CANCELLED";

export type OrderType =
  | "MARKET"
  | "LIMIT"
  | "STOP_LOSS"
  | "TAKE_PROFIT"
  | "TRAILING_STOP"
  | "DCA";

export interface TradeRequest {
  userId: number;

  tokenAddress: string;

  side: TradeSide;

  amountEth: number;

  slippage: number;

  orderType?: OrderType;

  limitPrice?: number;

  stopPrice?: number;

  takeProfitPercent?: number;

  stopLossPercent?: number;

  trailingStopPercent?: number;

  autoExecute?: boolean;
}

export interface TradeGuardResult {
  approved: boolean;

  score: number;

  reasons: string[];

  warnings: string[];

  liquidityScore?: number;

  momentumScore?: number;

  smartMoneyScore?: number;

  riskScore?: number;

  priceImpact?: number;

  estimatedGasEth?: number;

  estimatedSlippage?: number;

  timestamp?: number;
}

export interface SwapQuote {
  tokenIn: string;

  tokenOut: string;

  amountIn: bigint;

  expectedAmountOut: bigint;

  minimumAmountOut?: bigint;

  priceImpact: number;

  slippage: number;

  route?: string[];

  transaction?: TransactionRequest;
}

export interface TransactionRequest {
  from?: string;
  to?: string;
  data?: string;
  value?: bigint;

  gasLimit?: bigint;

  maxFeePerGas?: bigint;

  maxPriorityFeePerGas?: bigint;

  nonce?: number;

  chainId?: number;
}

export interface TransactionResult {
  success: boolean;

  txHash?: string;

  blockNumber?: number;

  gasUsed?: bigint;

  effectiveGasPrice?: bigint;

  error?: string;
}

export interface Order {
  id: string;

  userId: number;

  tokenAddress: string;

  symbol: string;

  side: TradeSide;

  type: OrderType;

  amount: string;

  price?: string;

  stopPrice?: string;

  status: TradeStatus;

  txHash?: string;

  createdAt: Date | number;

  updatedAt: Date | number;
}

export interface Position {
  id: string;

  userId: number;

  tokenAddress: string;

  symbol: string;

  amount: bigint;

  entryPrice: number;

  currentPrice: number;

  investedEth: number;

  currentValueEth: number;

  pnlEth: number;

  pnlPercent: number;

  highestPrice?: number;

  lowestPrice?: number;

  stopLossPrice?: number;

  takeProfitPrice?: number;

  trailingStopPrice?: number;

  openedAt: number;

  updatedAt: number;
}

export interface SniperConfig {
  enabled: boolean;

  minScore: number;

  maxRisk: number;

  minLiquidity: number;

  maxMarketCap: number;

  maxBuyEth: number;

  slippage: number;

  maxGasEth?: number;

  requireSimulation?: boolean;

  requireSmartMoney?: boolean;

  autoSell?: boolean;

  stopLossPercent?: number;

  takeProfitPercent?: number;
}

export interface AutopilotConfig {
  enabled: boolean;

  capitalEth: number;

  maxTradeEth: number;

  maxPositions: number;

  minScore: number;

  maxRisk: number;

  minLiquidity: number;

  slippage?: number;

  stopLossPercent: number;

  trailingStopPercent: number;

  takeProfitLevels: number[];

  requireSimulation?: boolean;

  requireSmartMoney?: boolean;

  maxDailyLossPercent?: number;

  cooldownSeconds?: number;
}

export interface SmartMoneyWallet {
  address: string;

  label?: string;

  score?: number;

  winRate?: number;

  totalTrades?: number;

  profitableTrades?: number;

  totalProfitEth?: number;

  lastActivity?: number;

  enabled?: boolean;
}

export interface SmartMoneyActivity {
  walletAddress: string;

  tokenAddress: string;

  symbol?: string;

  side: TradeSide;

  amountEth: number;

  price?: number;

  txHash: string;

  timestamp: number;
}

export type AlertType =
  | "MOMENTUM"
  | "SMART_MONEY"
  | "LIQUIDITY"
  | "WHALE"
  | "RISK"
  | "PRICE"
  | "TRADE"
  | "POSITION";

export interface Alert {
  id: string;

  userId: number;

  type: AlertType;

  tokenAddress?: string;

  symbol?: string;

  title: string;

  message: string;

  score?: number;

  timestamp: number;

  read?: boolean;
}

export interface PriceAlert {
  id: string;

  userId: number;

  tokenAddress: string;

  symbol: string;

  condition:
    | "ABOVE"
    | "BELOW";

  price: number;

  triggered: boolean;

  createdAt: number;

  triggeredAt?: number;
}

export interface WalletTracking {
  userId: number;

  walletAddress: string;

  label?: string;

  enabled: boolean;

  createdAt: number;
}

export interface PendingTrade {
  userId: number;

  tokenAddress: string;

  symbol: string;

  side: TradeSide;

  amountEth: string;

  slippage: number;

  expiresAt: number;
}

export interface ExecutionResult {
  success: boolean;

  status: TradeStatus;

  txHash?: string;

  guard?: TradeGuardResult;

  quote?: SwapQuote;

  transaction?: TransactionResult;

  error?: string;

  timestamp: number;
}

export interface MarketData {
  tokenAddress: string;

  symbol: string;

  price: number;

  marketCap: number;

  liquidity: number;

  volume24h: number;

  priceChange5m: number;

  priceChange1h: number;

  priceChange6h: number;

  priceChange24h: number;

  buys24h?: number;

  sells24h?: number;

  buyVolume24h?: number;

  sellVolume24h?: number;

  pairAddress?: string;

  dex?: string;

  timestamp: number;
}

export interface SwapRouter {
  getQuote(
    tokenIn: string,
    tokenOut: string,
    amountIn: bigint,
    slippage: number,
  ): Promise<SwapQuote>;

  buildBuyTransaction(
    quote: SwapQuote,
    wallet: string,
  ): Promise<TransactionRequest>;

  buildSellTransaction(
    quote: SwapQuote,
    wallet: string,
  ): Promise<TransactionRequest>;
}

export interface RiskResult {
  score: number;

  approved: boolean;

  reasons: string[];

  warnings: string[];

  checks: {
    liquidity: boolean;

    contract: boolean;

    slippage: boolean;

    priceImpact: boolean;

    marketCap: boolean;

    smartMoney?: boolean;

    simulation?: boolean;
  };
}

export interface SimulationResult {
  success: boolean;

  gasEstimate?: bigint;

  error?: string;

  revertReason?: string;

  timestamp?: number;
}

export interface GasEstimate {
  gasLimit: bigint;

  gasPrice?: bigint;

  maxFeePerGas?: bigint;

  maxPriorityFeePerGas?: bigint;

  costWei: bigint;

  costEth: string;
}

export interface ScannerResult {
  token: Token;

  score: number;

  approved: boolean;

  risk: RiskResult;

  timestamp: number;
}

export interface BotUser {
  id: number;

  username?: string;

  firstName?: string;

  walletAddress?: string;

  alertsEnabled: boolean;

  sniperEnabled: boolean;

  autopilotEnabled: boolean;

  createdAt: number;

  updatedAt: number;
}

export interface Pagination {
  page: number;

  limit: number;

  total: number;

  hasMore: boolean;
}

export interface ApiResponse<T> {
  success: boolean;

  data?: T;

  error?: string;

  timestamp: number;
}

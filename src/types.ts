export type TradeSide = "BUY" | "SELL";

export type OrderType =
  | "MARKET"
  | "LIMIT"
  | "STOP_LOSS"
  | "TAKE_PROFIT"
  | "TRAILING_STOP"
  | "DCA"
  | "CONDITIONAL";

export type AutomationStatus = "ON" | "OFF" | "PAUSED";

export interface Token {
  address: string;
  symbol: string;
  name: string;
  price: number;
  marketCap: number;
  liquidity: number;
  volume24h: number;
  holders: number;

  momentumScore: number;
  smartMoneyScore: number;
  liquidityScore: number;
  riskScore: number;

  buyPressure: number;
  whaleFlow: number;

  migrated: boolean;
}

export interface Position {
  id: string;
  tokenAddress: string;
  symbol: string;

  tokenAmount: string;
  investedEth: string;
  currentValueEth: string;

  entryPrice: number;
  currentPrice: number;

  pnlEth: number;
  pnlPercent: number;

  openedAt: Date;
}

export interface Order {
  id: string;
  tokenAddress: string;
  symbol: string;

  type: OrderType;
  side: TradeSide;

  amount: string;
  triggerPrice?: string;

  status: "OPEN" | "FILLED" | "CANCELLED";

  createdAt: Date;
}

export interface Wallet {
  userId: number;
  address: string;
  encryptedPrivateKey: string;
}

export interface TradeResult {
  success: boolean;
  txHash?: string;
  amountIn: string;
  amountOut?: string;
  priceImpact?: number;
  error?: string;
}

export interface SniperConfig {
  enabled: boolean;

  minLiquidity: number;
  maxMarketCap: number;

  minScore: number;
  maxRisk: number;

  maxBuyEth: string;
  maxPositions: number;

  slippage: number;
}

export interface AutopilotConfig {
  enabled: boolean;

  capitalEth: string;
  maxTradeEth: string;
  maxPositions: number;

  minScore: number;
  maxRisk: number;
  minLiquidity: number;

  stopLossPercent: number;
  trailingStopPercent: number;

  takeProfitLevels: number[];
}

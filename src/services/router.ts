import {
  TransactionRequest,
} from "ethers";

export interface SwapQuote {
  tokenIn: string;
  tokenOut: string;

  amountIn: bigint;
  expectedAmountOut: bigint;

  priceImpact: number;

  transaction:
    TransactionRequest;
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

/*
 * Router implementation will be
 * added once the exact Robinhood
 * Chain trading route is configured.
 */

export class RobinhoodRouter
  implements SwapRouter
{
  async getQuote(
    tokenIn: string,
    tokenOut: string,
    amountIn: bigint,
    slippage: number,
  ): Promise<SwapQuote> {
    void tokenIn;
    void tokenOut;
    void amountIn;
    void slippage;

    throw new Error(
      "Robinhood router quote provider not configured",
    );
  }

  async buildBuyTransaction(
    quote: SwapQuote,
    wallet: string,
  ) {
    void wallet;

    return quote.transaction;
  }

  async buildSellTransaction(
    quote: SwapQuote,
    wallet: string,
  ) {
    void wallet;

    return quote.transaction;
  }
}

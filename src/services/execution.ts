import {
  Wallet as EthersWallet,
  parseEther,
} from "ethers";

import {
  TradeRequest,
  TradeGuardResult,
  evaluateTrade,
} from "./tradeGuard";

import {
  simulateTransaction,
} from "./simulation";

import {
  provider,
} from "./rpc";

import {
  decryptPrivateKey,
  getWallet,
} from "./wallet";

export interface ExecutionResult {
  success: boolean;

  txHash?: string;

  guard: TradeGuardResult;

  error?: string;
}

export async function executeTrade(
  userId: number,
  request: TradeRequest,
): Promise<ExecutionResult> {
  /*
   * STEP 1
   * Trade Guard
   */

  const guard =
    evaluateTrade(
      request,
    );

  if (!guard.approved) {
    return {
      success: false,

      guard,

      error:
        guard.reasons.join(
          "; ",
        ),
    };
  }

  /*
   * STEP 2
   * Wallet
   */

  const storedWallet =
    getWallet(userId);

  if (!storedWallet) {
    return {
      success: false,

      guard,

      error:
        "Wallet not found",
    };
  }

  /*
   * STEP 3
   * Decrypt only inside the
   * execution scope.
   */

  let privateKey: string;

  try {
    privateKey =
      decryptPrivateKey(
        userId,
        storedWallet.id,
      );
  } catch {
    return {
      success: false,

      guard,

      error:
        "Unable to decrypt wallet credentials",
    };
  }

  /*
   * STEP 4
   * Create signer.
   */

  let signer: EthersWallet;

  try {
    signer =
      new EthersWallet(
        privateKey,
        provider,
      );
  } catch {
    return {
      success: false,

      guard,

      error:
        "Unable to initialize wallet signer",
    };
  }

  /*
   * STEP 5
   *
   * The router layer must provide
   * the actual swap transaction.
   *
   * Do not broadcast a transaction
   * with an undefined destination.
   */

  const transaction = {
    value:
      parseEther(
        request.amountEth.toString(),
      ),
  };

  /*
   * No router transaction exists yet.
   *
   * Simulation of an incomplete
   * transaction is intentionally
   * refused.
   */

  void signer;
  void transaction;

  return {
    success: false,

    guard,

    error:
      "Execution router not configured",
  };
}

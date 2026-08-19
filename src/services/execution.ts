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
    evaluateTrade(request);

  if (!guard.approved) {
    return {
      success: false,
      guard,
      error:
        guard.reasons.join("; "),
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
      error: "Wallet not found",
    };
  }

  /*
   * STEP 3
   * Private key is decrypted
   * only inside execution scope.
   */

  const privateKey =
    decryptPrivateKey(
      storedWallet.encryptedPrivateKey,
    );

  const signer =
    new EthersWallet(
      privateKey,
      provider,
    );

  /*
   * STEP 4
   * The actual swap transaction
   * will be constructed by the
   * router layer.
   */

  const transaction = {
    to: undefined,
    value: parseEther(
      request.amountEth.toString(),
    ),
  };

  /*
   * We intentionally refuse to
   * broadcast until a real router
   * transaction has been constructed.
   */

  const simulation =
    await simulateTransaction(
      transaction,
    );

  if (!simulation.success) {
    return {
      success: false,
      guard,
      error:
        simulation.error ??
        "Transaction simulation failed",
    };
  }

  void signer;

  return {
    success: false,
    guard,
    error:
      "Execution router not configured",
  };
}

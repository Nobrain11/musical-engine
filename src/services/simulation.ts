import {
  Contract,
  TransactionRequest,
} from "ethers";

import {
  provider,
} from "./rpc";

export interface SimulationResult {
  success: boolean;
  gasEstimate?: bigint;
  error?: string;
}

export async function simulateTransaction(
  transaction: TransactionRequest,
): Promise<SimulationResult> {
  try {
    if (!transaction.to) {
      return {
        success: false,
        error: "Missing transaction target",
      };
    }

    const gasEstimate =
      await provider.estimateGas(
        transaction,
      );

    return {
      success: true,
      gasEstimate,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Simulation failed",
    };
  }
}

export async function simulateContractCall(
  contractAddress: string,
  abi: string[],
  method: string,
  args: unknown[],
): Promise<SimulationResult> {
  try {
    const contract = new Contract(
      contractAddress,
      abi,
      provider,
    );

    await contract[method].staticCall(
      ...args,
    );

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Contract simulation failed",
    };
  }
}

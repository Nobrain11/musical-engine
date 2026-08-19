import {
  formatUnits,
} from "ethers";

import {
  provider,
} from "./rpc";

export async function getGasPrice() {
  return provider.getFeeData();
}

export async function estimateGasCost(
  gasLimit: bigint,
) {
  const feeData =
    await provider.getFeeData();

  const gasPrice =
    feeData.gasPrice ?? 0n;

  const cost =
    gasLimit * gasPrice;

  return {
    gasLimit,
    gasPrice,
    costWei: cost,
    costEth: formatUnits(
      cost,
      18,
    ),
  };
}

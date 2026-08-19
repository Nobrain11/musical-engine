import {
  formatEther,
  formatUnits,
} from "ethers";

import {
  provider,
} from "./rpc";

export async function getChainStatus() {
  const network =
    await provider.getNetwork();

  const block =
    await provider.getBlockNumber();

  return {
    chainId: network.chainId.toString(),
    block,
  };
}

export async function getETHBalance(
  address: string,
): Promise<string> {
  const balance =
    await provider.getBalance(address);

  return formatEther(balance);
}

export async function getERC20Balance(
  tokenAddress: string,
  walletAddress: string,
  decimals: number,
): Promise<string> {
  const data =
    "0x70a08231" +
    walletAddress
      .replace(/^0x/, "")
      .padStart(64, "0");

  const result =
    await provider.call({
      to: tokenAddress,
      data,
    });

  return formatUnits(
    BigInt(result),
    decimals,
  );
}

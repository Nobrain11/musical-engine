import {
  Contract,
} from "ethers";

import {
  provider,
} from "./rpc";

const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
];

export async function getTokenContract(
  address: string,
) {
  return new Contract(
    address,
    ERC20_ABI,
    provider,
  );
}

export async function getTokenMetadata(
  address: string,
) {
  const contract =
    await getTokenContract(address);

  const [
    name,
    symbol,
    decimals,
    totalSupply,
  ] = await Promise.all([
    contract.name(),
    contract.symbol(),
    contract.decimals(),
    contract.totalSupply(),
  ]);

  return {
    address,
    name,
    symbol,
    decimals: Number(decimals),
    totalSupply,
  };
}

export async function getTokenBalance(
  tokenAddress: string,
  walletAddress: string,
) {
  const contract =
    await getTokenContract(
      tokenAddress,
    );

  const [
    decimals,
    balance,
  ] = await Promise.all([
    contract.decimals(),
    contract.balanceOf(
      walletAddress,
    ),
  ]);

  return {
    raw: balance,
    decimals: Number(decimals),
  };
}

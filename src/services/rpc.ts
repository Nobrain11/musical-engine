import {
  JsonRpcProvider,
} from "ethers";

import { config } from "../config";

export const provider =
  new JsonRpcProvider(
    config.robinhood.rpcUrl,
    config.robinhood.chainId,
    {
      staticNetwork: true,
    },
  );

export async function getBlockNumber() {
  return provider.getBlockNumber();
}

export async function getNetwork() {
  return provider.getNetwork();
}

export async function getNativeBalance(
  address: string,
) {
  return provider.getBalance(address);
}

export async function getTransaction(
  hash: string,
) {
  return provider.getTransaction(hash);
}

export async function getReceipt(
  hash: string,
) {
  return provider.getTransactionReceipt(hash);
}

export async function waitForTransaction(
  hash: string,
  confirmations = 1,
) {
  return provider.waitForTransaction(
    hash,
    confirmations,
  );
}

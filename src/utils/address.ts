import {
  getAddress,
  isAddress,
} from "ethers";

export function validateAddress(
  address: string,
): boolean {
  return isAddress(address);
}

export function normalizeAddress(
  address: string,
): string {
  return getAddress(address);
}

export function shortenAddress(
  address: string,
): string {
  return `${address.slice(
    0,
    6,
  )}...${address.slice(-4)}`;
}

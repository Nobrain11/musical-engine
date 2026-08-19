import {
  getAddress,
  isAddress,
} from "ethers";

export function isValidAddress(
  address: string,
): boolean {
  if (
    typeof address !== "string" ||
    !address.trim()
  ) {
    return false;
  }

  return isAddress(
    address.trim(),
  );
}

export function validateAddress(
  address: string,
): boolean {
  return isValidAddress(address);
}

export function normalizeAddress(
  address: string,
): string {
  if (
    !isValidAddress(address)
  ) {
    throw new Error(
      "Invalid EVM address",
    );
  }

  return getAddress(
    address.trim(),
  );
}

export function isValidPrivateKey(
  privateKey: string,
): boolean {
  if (
    typeof privateKey !== "string"
  ) {
    return false;
  }

  return /^0x[0-9a-fA-F]{64}$/.test(
    privateKey.trim(),
  );
}

export function normalizePrivateKey(
  privateKey: string,
): string {
  const normalized =
    privateKey.trim();

  if (
    !isValidPrivateKey(
      normalized,
    )
  ) {
    throw new Error(
      "Invalid private key",
    );
  }

  return normalized;
}

export function isPositiveNumber(
  value: unknown,
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0
  );
}

export function isNonNegativeNumber(
  value: unknown,
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0
  );
}

export function clamp(
  value: number,
  min: number,
  max: number,
): number {
  return Math.min(
    max,
    Math.max(min, value),
  );
}

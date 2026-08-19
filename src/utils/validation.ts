export function isValidAddress(
  address: string,
): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function isPositiveNumber(
  value: string,
): boolean {
  const number = Number(value);

  return Number.isFinite(number) && number > 0;
}

export function isPercentage(
  value: number,
): boolean {
  return (
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 100
  );
}

export function money(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }

  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }

  return `$${value.toFixed(2)}`;
}

export function percent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export function scoreBar(score: number): string {
  const filled = Math.round(score / 10);

  return (
    "█".repeat(filled) +
    "░".repeat(10 - filled)
  );
}

export function shortenAddress(
  address: string,
): string {
  if (address.length < 12) return address;

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export interface WalletActivity {
  wallet: string;
  tokenAddress: string;
  symbol: string;

  side: "BUY" | "SELL";

  amountEth: number;
  timestamp: number;
}

const trackedWallets = new Set<
  string
>();

export function trackWallet(
  address: string,
) {
  trackedWallets.add(address);
}

export function untrackWallet(
  address: string,
) {
  trackedWallets.delete(address);
}

export function isTrackedWallet(
  address: string,
): boolean {
  return trackedWallets.has(address);
}

export function getTrackedWallets() {
  return Array.from(
    trackedWallets,
  );
}

export async function getWhaleActivity(): Promise<
  WalletActivity[]
> {
  /*
   * Connect Robinhood Chain event/RPC
   * monitoring here.
   */

  return [];
}

export async function getSmartMoneyFlow(
  tokenAddress: string,
): Promise<number> {
  const activity =
    await getWhaleActivity();

  return activity
    .filter(
      (item) =>
        item.tokenAddress ===
        tokenAddress,
    )
    .reduce(
      (total, item) =>
        total +
        (item.side === "BUY"
          ? item.amountEth
          : -item.amountEth),
      0,
    );
}

import { Token } from "../types";

export async function getToken(
  address: string,
): Promise<Token | null> {
  /*
   * Connect real Robinhood market data here.
   *
   * Never return fake production data.
   */

  return null;
}

export async function searchTokens(
  query: string,
): Promise<Token[]> {
  /*
   * Implement Robinhood token search.
   */

  return [];
}

export async function getPrice(
  address: string,
): Promise<number> {
  const token = await getToken(address);

  return token?.price ?? token?.priceUsd ?? 0;
}

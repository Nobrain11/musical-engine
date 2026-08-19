const DEX_SCREENER_API = 'https://api.dexscreener.com/latest/dex/search';

export async function searchTokens(query: string) {
  const res = await fetch(`${DEX_SCREENER_API}?q=${encodeURIComponent(query)}`);
  const data = await res.json();
  if (data.pairs) {
    return data.pairs.filter((p: any) => p.chainId === 'robinhood');
  }
  return [];
}

export async function getTokenByAddress(address: string) {
  const results = await searchTokens(address);
  return results.length > 0 ? results[0] : null;
}

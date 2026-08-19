export function walletMessage(
  address: string,
  balance: string,
) {
  return `
💼 <b>WALLET</b>

━━━━━━━━━━━━━━━━

Address
<code>${address}</code>

Balance
<b>${balance} ETH</b>

━━━━━━━━━━━━━━━━

🔐 Private key encrypted
🛡 Transaction protection active
`;
}

export function tokenMessage(
  token: {
    name: string;
    symbol: string;
    address: string;
    decimals: number;
  },
) {
  return `
🪙 <b>${token.symbol}</b>

${token.name}

━━━━━━━━━━━━━━━━

Contract
<code>${token.address}</code>

Decimals
${token.decimals}

━━━━━━━━━━━━━━━━
`;
}

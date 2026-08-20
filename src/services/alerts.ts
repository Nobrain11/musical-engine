import { Telegraf } from "telegraf";
import { Token } from "../types";

const subscribers = new Set<number>();

export function subscribe(
  userId: number,
) {
  subscribers.add(userId);
}

export function unsubscribe(
  userId: number,
) {
  subscribers.delete(userId);
}

export async function sendTokenAlert(
  bot: Telegraf,
  token: Token,
  reason: string,
) {
  const message = `
🚨 <b>ERROR404 SIGNAL</b>

$${token.symbol}

━━━━━━━━━━━━━━━━

🔥 Score
${token.momentumScore}/100

🐋 Smart Money
${token.smartMoneyScore}/100

💧 Liquidity
${token.liquidityScore}/100

🛡 Risk
${token.riskScore}/100

━━━━━━━━━━━━━━━━

${reason}

━━━━━━━━━━━━━━━━

Price
$${token.price ?? token.priceUsd ?? 0}
`;

  for (const userId of subscribers) {
    try {
      await bot.telegram.sendMessage(
        userId,
        message,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "⚡ BUY",
                  callback_data:
                    `tokenbuy:${token.address}:0.10`,
                },
              ],
              [
                {
                  text: "🐋 WHALES",
                  callback_data:
                    `whales:${token.address}`,
                },
              ],
            ],
          },
        },
      );
    } catch {
      // User may have blocked the bot.
    }
  }
}

import {
  Context,
  Telegraf,
} from "telegraf";

export interface PendingTrade {
  userId: number;
  tokenAddress: string;
  symbol: string;
  side: "BUY" | "SELL";
  amountEth: string;
  expiresAt: number;
}

const pending =
  new Map<number, PendingTrade>();

export function createConfirmation(
  trade: PendingTrade,
) {
  pending.set(
    trade.userId,
    trade,
  );
}

export function getConfirmation(
  userId: number,
) {
  const trade =
    pending.get(userId);

  if (!trade) {
    return undefined;
  }

  if (
    Date.now() >
    trade.expiresAt
  ) {
    pending.delete(userId);

    return undefined;
  }

  return trade;
}

export function removeConfirmation(
  userId: number,
) {
  pending.delete(userId);
}

export async function askConfirmation(
  ctx: Context,
  trade: PendingTrade,
) {
  createConfirmation(trade);

  await ctx.reply(
    `⚠️ <b>TRADE CONFIRMATION</b>

━━━━━━━━━━━━━━━━

${trade.side === "BUY" ? "🟢 BUY" : "🔴 SELL"}

Token:
<b>${trade.symbol}</b>

Amount:
<b>${trade.amountEth} ETH</b>

━━━━━━━━━━━━━━━━

This transaction will be simulated
again before execution.

Confirmation expires in 30 seconds.`,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "✅ CONFIRM",
              callback_data:
                "confirm_trade",
            },
            {
              text: "❌ CANCEL",
              callback_data:
                "cancel_trade",
            },
          ],
        ],
      },
    },
  );
}

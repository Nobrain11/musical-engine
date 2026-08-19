import { Context } from "telegraf";

import {
  getConfirmation,
  removeConfirmation,
} from "../services/confirmation";

export async function confirmTrade(
  ctx: Context,
) {
  const userId =
    ctx.from?.id;

  if (!userId) return;

  const trade =
    getConfirmation(userId);

  if (!trade) {
    await ctx.answerCbQuery(
      "Trade expired",
    );

    return;
  }

  await ctx.answerCbQuery(
    "Trade confirmed",
  );

  removeConfirmation(userId);

  await ctx.editMessageText(
    `⚡ <b>EXECUTING</b>

${trade.side === "BUY" ? "🟢 BUY" : "🔴 SELL"}

${trade.symbol}

Amount:
${trade.amountEth} ETH

Running final simulation...`,
    {
      parse_mode: "HTML",
    },
  );

  /*
   * Next:
   *
   * 1. Re-fetch token
   * 2. Re-run risk engine
   * 3. Get fresh quote
   * 4. Recalculate price impact
   * 5. Build transaction
   * 6. Sign
   * 7. Broadcast
   */
}

export async function cancelTrade(
  ctx: Context,
) {
  const userId =
    ctx.from?.id;

  if (!userId) return;

  removeConfirmation(userId);

  await ctx.answerCbQuery(
    "Trade cancelled",
  );

  await ctx.editMessageText(
    `❌ <b>TRADE CANCELLED</b>`,
    {
      parse_mode: "HTML",
    },
  );
}

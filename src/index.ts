import "dotenv/config";

import { Telegraf } from "telegraf";

import { config } from "./config";
import { logger } from "./utils/logger";

import {
  homeKeyboard,
  backHome,
} from "./bot/keyboards";

import {
  getWallet,
  createWallet,
  getBalance,
} from "./services/wallet";

import {
  getToken,
  searchTokens,
} from "./services/market";

import {
  analyzeToken,
} from "./services/scanner";

import {
  getPositions,
} from "./services/positions";

import {
  getOrders,
} from "./services/orders";

import {
  getSniperConfig,
  startSniper,
  stopSniper,
} from "./services/sniper";

import {
  getAutopilotConfig,
  startAutopilot,
  stopAutopilot,
} from "./services/autopilot";

import {
  getTrackedWallets,
  trackWallet,
  untrackWallet,
} from "./services/smartMoney";

import {
  subscribe,
  unsubscribe,
} from "./services/alerts";

import {
  confirmTrade,
  cancelTrade,
} from "./bot/tradeFlow";

import {
  shortenAddress,
  money,
  percent,
  scoreBar,
} from "./utils/format";

import {
  validateAddress,
} from "./utils/validation";

const bot = new Telegraf(
  config.telegram.token,
);

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function userIdFromContext(
  ctx: any,
): number | null {
  return ctx.from?.id ?? null;
}

async function showHome(
  ctx: any,
) {
  await ctx.reply(
    `⚡ <b>ERROR404</b>

<b>Robinhood Chain Trading Bot</b>

━━━━━━━━━━━━━━━━

Fast execution.
Smart risk controls.
Automated strategies.

Select an action below.`,
    {
      parse_mode: "HTML",
      reply_markup: homeKeyboard,
    },
  );
}

/*
|--------------------------------------------------------------------------
| START
|--------------------------------------------------------------------------
*/

bot.start(async (ctx) => {
  const userId =
    userIdFromContext(ctx);

  if (!userId) return;

  await showHome(ctx);
});

/*
|--------------------------------------------------------------------------
| HELP
|--------------------------------------------------------------------------
*/

bot.command(
  "help",
  async (ctx) => {
    await ctx.reply(
      `⚡ <b>ERROR404 COMMANDS</b>

━━━━━━━━━━━━━━━━

/start
Open the terminal

/wallet
Wallet information

/balance
Check balance

/scan
Scan a token

/positions
Open positions

/orders
Open orders

/sniper
Sniper settings

/autopilot
Autopilot settings

/smartmoney
Smart-money wallets

/alerts
Manage alerts

━━━━━━━━━━━━━━━━

Send a token contract address
to analyze it.`,
      {
        parse_mode: "HTML",
        reply_markup: backHome(),
      },
    );
  },
);

/*
|--------------------------------------------------------------------------
| WALLET
|--------------------------------------------------------------------------
*/

bot.command(
  "wallet",
  async (ctx) => {
    const userId =
      userIdFromContext(ctx);

    if (!userId) return;

    const wallet =
      getWallet(userId);

    if (!wallet) {
      await ctx.reply(
        `💼 <b>NO WALLET</b>

You don't have a trading wallet yet.

Create one below.`,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "➕ CREATE WALLET",
                  callback_data:
                    "create_wallet",
                },
              ],
              [
                {
                  text: "🏠 HOME",
                  callback_data:
                    "home",
                },
              ],
            ],
          },
        },
      );

      return;
    }

    const balance =
      await getBalance(userId);

    await ctx.reply(
      `💼 <b>WALLET</b>

━━━━━━━━━━━━━━━━

Address

<code>${wallet.address}</code>

Balance

<b>${balance} ETH</b>

━━━━━━━━━━━━━━━━

🔐 Private key encrypted
🛡️ Protected execution`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🔄 REFRESH",
                callback_data:
                  "wallet",
              },
            ],
            [
              {
                text: "🏠 HOME",
                callback_data:
                  "home",
              },
            ],
          ],
        },
      },
    );
  },
);

/*
|--------------------------------------------------------------------------
| BALANCE
|--------------------------------------------------------------------------
*/

bot.command(
  "balance",
  async (ctx) => {
    const userId =
      userIdFromContext(ctx);

    if (!userId) return;

    const wallet =
      getWallet(userId);

    if (!wallet) {
      await ctx.reply(
        "You don't have a wallet yet.",
      );

      return;
    }

    const balance =
      await getBalance(userId);

    await ctx.reply(
      `💰 <b>BALANCE</b>

<code>${wallet.address}</code>

<b>${balance} ETH</b>`,
      {
        parse_mode: "HTML",
        reply_markup: backHome(),
      },
    );
  },
);

/*
|--------------------------------------------------------------------------
| CREATE WALLET
|--------------------------------------------------------------------------
*/

bot.action(
  "create_wallet",
  async (ctx) => {
    const userId =
      userIdFromContext(ctx);

    if (!userId) return;

    await ctx.answerCbQuery();

    const existing =
      getWallet(userId);

    if (existing) {
      await ctx.editMessageText(
        `💼 <b>WALLET ALREADY EXISTS</b>

<code>${existing.address}</code>`,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "💼 WALLET",
                  callback_data:
                    "wallet",
                },
              ],
              [
                {
                  text: "🏠 HOME",
                  callback_data:
                    "home",
                },
              ],
            ],
          },
        },
      );

      return;
    }

    try {
      const wallet =
        await createWallet(userId);

      await ctx.editMessageText(
        `✅ <b>WALLET CREATED</b>

━━━━━━━━━━━━━━━━

Address

<code>${wallet.address}</code>

━━━━━━━━━━━━━━━━

🔐 Your private key is encrypted.

⚠️ Never expose private keys
inside Telegram messages.`,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "💰 BALANCE",
                  callback_data:
                    "wallet",
                },
              ],
              [
                {
                  text: "🏠 HOME",
                  callback_data:
                    "home",
                },
              ],
            ],
          },
        },
      );
    } catch (error) {
      logger.error(
        "Wallet creation failed",
        error,
      );

      await ctx.reply(
        "❌ Unable to create wallet.",
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| SCAN COMMAND
|--------------------------------------------------------------------------
*/

bot.command(
  "scan",
  async (ctx) => {
    await ctx.reply(
      `🔎 <b>TOKEN SCANNER</b>

Send a Robinhood Chain token contract address.`,
      {
        parse_mode: "HTML",
        reply_markup: backHome(),
      },
    );
  },
);

/*
|--------------------------------------------------------------------------
| POSITIONS
|--------------------------------------------------------------------------
*/

bot.command(
  "positions",
  async (ctx) => {
    const userId =
      userIdFromContext(ctx);

    if (!userId) return;

    const positions =
      getPositions(userId);

    if (positions.length === 0) {
      await ctx.reply(
        `📊 <b>POSITIONS</b>

No open positions.`,
        {
          parse_mode: "HTML",
          reply_markup: backHome(),
        },
      );

      return;
    }

    const lines =
      positions.map(
        (position, index) =>
          `${index + 1}. <b>${
            position.symbol
          }</b>

Entry: ${position.entryPrice}
Current: ${position.currentPrice}
PnL: ${percent(
            position.pnlPercent,
          )}`,
      );

    await ctx.reply(
      `📊 <b>POSITIONS</b>

━━━━━━━━━━━━━━━━

${lines.join(
        "\n\n",
      )}

━━━━━━━━━━━━━━━━`,
      {
        parse_mode: "HTML",
        reply_markup: backHome(),
      },
    );
  },
);

/*
|--------------------------------------------------------------------------
| ORDERS
|--------------------------------------------------------------------------
*/

bot.command(
  "orders",
  async (ctx) => {
    const userId =
      userIdFromContext(ctx);

    if (!userId) return;

    const orders =
      getOrders(userId);

    if (orders.length === 0) {
      await ctx.reply(
        `📋 <b>ORDERS</b>

No orders.`,
        {
          parse_mode: "HTML",
          reply_markup: backHome(),
        },
      );

      return;
    }

    const lines =
      orders.map(
        (order, index) =>
          `${index + 1}. ${order.side} ${
            order.symbol
          }

Type: ${order.type}
Amount: ${order.amount}
Status: ${order.status}`,
      );

    await ctx.reply(
      `📋 <b>ORDERS</b>

━━━━━━━━━━━━━━━━

${lines.join(
        "\n\n",
      )}`,
      {
        parse_mode: "HTML",
        reply_markup: backHome(),
      },
    );
  },
);

/*
|--------------------------------------------------------------------------
| SNIPER
|--------------------------------------------------------------------------
*/

bot.command(
  "sniper",
  async (ctx) => {
    const userId =
      userIdFromContext(ctx);

    if (!userId) return;

    const sniper =
      getSniperConfig(userId);

    await ctx.reply(
      `🎯 <b>SNIPER</b>

━━━━━━━━━━━━━━━━

Status:
<b>${sniper.enabled ? "🟢 ON" : "🔴 OFF"}</b>

Minimum Score:
${sniper.minScore}

Maximum Risk:
${sniper.maxRisk}

Minimum Liquidity:
${money(
        sniper.minLiquidity,
      )}

Maximum Market Cap:
${money(
        sniper.maxMarketCap,
      )}

Maximum Buy:
${sniper.maxBuyEth} ETH

Slippage:
${sniper.slippage}%

━━━━━━━━━━━━━━━━`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: sniper.enabled
                  ? "🔴 STOP"
                  : "🟢 START",
                callback_data:
                  sniper.enabled
                    ? "sniper_stop"
                    : "sniper_start",
              },
            ],
            [
              {
                text: "🏠 HOME",
                callback_data:
                  "home",
              },
            ],
          ],
        },
      },
    );
  },
);

/*
|--------------------------------------------------------------------------
| AUTOPILOT
|--------------------------------------------------------------------------
*/

bot.command(
  "autopilot",
  async (ctx) => {
    const userId =
      userIdFromContext(ctx);

    if (!userId) return;

    const autopilot =
      getAutopilotConfig(
        userId,
      );

    await ctx.reply(
      `🤖 <b>AUTOPILOT</b>

━━━━━━━━━━━━━━━━

Status:
<b>${
        autopilot.enabled
          ? "🟢 ACTIVE"
          : "🔴 OFF"
      }</b>

Capital:
${autopilot.capitalEth} ETH

Maximum Trade:
${autopilot.maxTradeEth} ETH

Maximum Positions:
${autopilot.maxPositions}

Minimum Score:
${autopilot.minScore}

Maximum Risk:
${autopilot.maxRisk}

Stop Loss:
${autopilot.stopLossPercent}%

Trailing Stop:
${autopilot.trailingStopPercent}%

Take Profit:
${autopilot.takeProfitLevels.join(
        "% / ",
      )}%

━━━━━━━━━━━━━━━━`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: autopilot.enabled
                  ? "🔴 STOP"
                  : "🟢 START",
                callback_data:
                  autopilot.enabled
                    ? "autopilot_stop"
                    : "autopilot_start",
              },
            ],
            [
              {
                text: "🏠 HOME",
                callback_data:
                  "home",
              },
            ],
          ],
        },
      },
    );
  },
);

/*
|--------------------------------------------------------------------------
| SMART MONEY
|--------------------------------------------------------------------------
*/

bot.command(
  "smartmoney",
  async (ctx) => {
    const wallets =
      getTrackedWallets();

    await ctx.reply(
      `🐋 <b>SMART MONEY</b>

Tracked wallets:
<b>${wallets.length}</b>

${
  wallets.length === 0
    ? "No wallets tracked yet."
    : wallets
        .map(
          (wallet) =>
            `<code>${shortenAddress(
              wallet,
            )}</code>`,
        )
        .join("\n")
}`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "➕ TRACK WALLET",
                callback_data:
                  "track_wallet",
              },
            ],
            [
              {
                text: "🏠 HOME",
                callback_data:
                  "home",
              },
            ],
          ],
        },
      },
    );
  },
);

/*
|--------------------------------------------------------------------------
| ALERTS
|--------------------------------------------------------------------------
*/

bot.command(
  "alerts",
  async (ctx) => {
    await ctx.reply(
      `🔔 <b>ALERTS</b>

Get ERROR404 signals directly in Telegram.

Signals include:

🔥 Momentum
🐋 Smart Money
💧 Liquidity
🚨 Risk
⚡ Trading opportunities`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🔔 ENABLE",
                callback_data:
                  "alerts_on",
              },
              {
                text: "🔕 DISABLE",
                callback_data:
                  "alerts_off",
              },
            ],
            [
              {
                text: "🏠 HOME",
                callback_data:
                  "home",
              },
            ],
          ],
        },
      },
    );
  },
);

/*
|--------------------------------------------------------------------------
| HOME CALLBACK
|--------------------------------------------------------------------------
*/

bot.action(
  "home",
  async (ctx) => {
    await ctx.answerCbQuery();

    await ctx.editMessageText(
      `⚡ <b>ERROR404</b>

<b>Robinhood Chain Trading Bot</b>

━━━━━━━━━━━━━━━━

Fast execution.
Smart risk controls.
Automated strategies.

Select an action below.`,
      {
        parse_mode: "HTML",
        reply_markup:
          homeKeyboard,
      },
    );
  },
);

/*
|--------------------------------------------------------------------------
| WALLET CALLBACK
|--------------------------------------------------------------------------
*/

bot.action(
  "wallet",
  async (ctx) => {
    const userId =
      userIdFromContext(ctx);

    if (!userId) return;

    await ctx.answerCbQuery();

    const wallet =
      getWallet(userId);

    if (!wallet) {
      await ctx.editMessageText(
        `💼 <b>NO WALLET</b>

Create your trading wallet.`,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "➕ CREATE WALLET",
                  callback_data:
                    "create_wallet",
                },
              ],
              [
                {
                  text: "🏠 HOME",
                  callback_data:
                    "home",
                },
              ],
            ],
          },
        },
      );

      return;
    }

    const balance =
      await getBalance(userId);

    await ctx.editMessageText(
      `💼 <b>WALLET</b>

━━━━━━━━━━━━━━━━

<code>${wallet.address}</code>

Balance:
<b>${balance} ETH</b>`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🔄 REFRESH",
                callback_data:
                  "wallet",
              },
            ],
            [
              {
                text: "🏠 HOME",
                callback_data:
                  "home",
              },
            ],
          ],
        },
      },
    );
  },
);

/*
|--------------------------------------------------------------------------
| TRADE
|--------------------------------------------------------------------------
*/

bot.action(
  "trade",
  async (ctx) => {
    await ctx.answerCbQuery();

    await ctx.editMessageText(
      `⚡ <b>TRADE</b>

Send a token contract address.

ERROR404 will analyze it before allowing execution.`,
      {
        parse_mode: "HTML",
        reply_markup: backHome(),
      },
    );
  },
);

/*
|--------------------------------------------------------------------------
| SCAN CALLBACK
|--------------------------------------------------------------------------
*/

bot.action(
  "scan",
  async (ctx) => {
    await ctx.answerCbQuery();

    await ctx.editMessageText(
      `🔎 <b>SCAN TOKEN</b>

Send a Robinhood Chain token contract address.

The scanner will calculate:

🔥 Momentum
🐋 Smart Money
💧 Liquidity
🛡 Risk
📊 Execution Score`,
      {
        parse_mode: "HTML",
        reply_markup: backHome(),
      },
    );
  },
);

/*
|--------------------------------------------------------------------------
| POSITIONS CALLBACK
|--------------------------------------------------------------------------
*/

bot.action(
  "positions",
  async (ctx) => {
    const userId =
      userIdFromContext(ctx);

    if (!userId) return;

    await ctx.answerCbQuery();

    const positions =
      getPositions(userId);

    if (!positions.length) {
      await ctx.editMessageText(
        `📊 <b>POSITIONS</b>

No open positions.`,
        {
          parse_mode: "HTML",
          reply_markup:
            backHome(),
        },
      );

      return;
    }

    await ctx.editMessageText(
      `📊 <b>POSITIONS</b>

${positions
  .map(
    (position) =>
      `• <b>${position.symbol}</b>
PnL: ${percent(
        position.pnlPercent,
      )}`,
  )
  .join("\n\n")}`,
      {
        parse_mode: "HTML",
        reply_markup:
          backHome(),
      },
    );
  },
);

/*
|--------------------------------------------------------------------------
| ORDERS CALLBACK
|--------------------------------------------------------------------------
*/

bot.action(
  "orders",
  async (ctx) => {
    const userId =
      userIdFromContext(ctx);

    if (!userId) return;

    await ctx.answerCbQuery();

    const orders =
      getOrders(userId);

    await ctx.editMessageText(
      `📋 <b>ORDERS</b>

${
  orders.length
    ? orders
        .map(
          (order) =>
            `${order.side} ${order.symbol}
${order.type} • ${order.status}`,
        )
        .join("\n\n")
    : "No orders."
}`,
      {
        parse_mode: "HTML",
        reply_markup:
          backHome(),
      },
    );
  },
);

/*
|--------------------------------------------------------------------------
| SNIPER CALLBACK
|--------------------------------------------------------------------------
*/

bot.action(
  "sniper",
  async (ctx) => {
    const userId =
      userIdFromContext(ctx);

    if (!userId) return;

    await ctx.answerCbQuery();

    const sniper =
      getSniperConfig(userId);

    await ctx.editMessageText(
      `🎯 <b>SNIPER</b>

Status:
<b>${
        sniper.enabled
          ? "🟢 ON"
          : "🔴 OFF"
      }</b>

Score ≥ ${sniper.minScore}

Risk ≤ ${sniper.maxRisk}

Liquidity ≥ ${money(
        sniper.minLiquidity,
      )}

Max Buy:
${sniper.maxBuyEth} ETH`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: sniper.enabled
                  ? "🔴 STOP"
                  : "🟢 START",
                callback_data:
                  sniper.enabled
                    ? "sniper_stop"
                    : "sniper_start",
              },
            ],
            [
              {
                text: "🏠 HOME",
                callback_data:
                  "home",
              },
            ],
          ],
        },
      },
    );
  },
);

bot.action(
  "sniper_start",
  async (ctx) => {
    const userId =
      userIdFromContext(ctx);

    if (!userId) return;

    startSniper(userId);

    await ctx.answerCbQuery(
      "Sniper enabled",
    );

    await ctx.editMessageText(
      `🎯 <b>SNIPER ACTIVE</b>

ERROR404 is now monitoring for qualifying opportunities.

No trade is executed without the Trade Guard.`,
      {
        parse_mode: "HTML",
        reply_markup: backHome(),
      },
    );
  },
);

bot.action(
  "sniper_stop",
  async (ctx) => {
    const userId =
      userIdFromContext(ctx);

    if (!userId) return;

    stopSniper(userId);

    await ctx.answerCbQuery(
      "Sniper stopped",
    );

    await ctx.editMessageText(
      `🛑 <b>SNIPER STOPPED</b>

No new sniper trades will be initiated.`,
      {
        parse_mode: "HTML",
        reply_markup: backHome(),
      },
    );
  },
);

/*
|--------------------------------------------------------------------------
| AUTOPILOT CALLBACK
|--------------------------------------------------------------------------
*/

bot.action(
  "autopilot",
  async (ctx) => {
    const userId =
      userIdFromContext(ctx);

    if (!userId) return;

    await ctx.answerCbQuery();

    const autopilot =
      getAutopilotConfig(
        userId,
      );

    await ctx.editMessageText(
      `🤖 <b>AUTOPILOT</b>

Status:
<b>${
        autopilot.enabled
          ? "🟢 ACTIVE"
          : "🔴 OFF"
      }</b>

Capital:
${autopilot.capitalEth} ETH

Max trade:
${autopilot.maxTradeEth} ETH

Max positions:
${autopilot.maxPositions}

Score ≥ ${autopilot.minScore}

Risk ≤ ${autopilot.maxRisk}

Stop loss:
${autopilot.stopLossPercent}%`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: autopilot.enabled
                  ? "🔴 STOP"
                  : "🟢 START",
                callback_data:
                  autopilot.enabled
                    ? "autopilot_stop"
                    : "autopilot_start",
              },
            ],
            [
              {
                text: "🏠 HOME",
                callback_data:
                  "home",
              },
            ],
          ],
        },
      },
    );
  },
);

bot.action(
  "autopilot_start",
  async (ctx) => {
    const userId =
      userIdFromContext(ctx);

    if (!userId) return;

    startAutopilot(userId);

    await ctx.answerCbQuery(
      "Autopilot enabled",
    );

    await ctx.editMessageText(
      `🤖 <b>AUTOPILOT ACTIVE</b>

ERROR404 is now monitoring the market.

Every trade passes through:

• Risk engine
• Trade Guard
• Simulation
• Slippage protection
• Final execution check`,
      {
        parse_mode: "HTML",
        reply_markup:
          backHome(),
      },
    );
  },
);

bot.action(
  "autopilot_stop",
  async (ctx) => {
    const userId =
      userIdFromContext(ctx);

    if (!userId) return;

    stopAutopilot(userId);

    await ctx.answerCbQuery(
      "Autopilot stopped",
    );

    await ctx.editMessageText(
      `🛑 <b>AUTOPILOT STOPPED</b>

Existing positions remain untouched.`,
      {
        parse_mode: "HTML",
        reply_markup:
          backHome(),
      },
    );
  },
);

/*
|--------------------------------------------------------------------------
| SMART MONEY CALLBACK
|--------------------------------------------------------------------------
*/

bot.action(
  "smart_money",
  async (ctx) => {
    await ctx.answerCbQuery();

    const wallets =
      getTrackedWallets();

    await ctx.editMessageText(
      `🐋 <b>SMART MONEY</b>

Tracked wallets:
<b>${wallets.length}</b>

${
  wallets.length
    ? wallets
        .map(
          (wallet) =>
            `<code>${shortenAddress(
              wallet,
            )}</code>`,
        )
        .join("\n")
    : "No wallets tracked."
}`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "➕ TRACK WALLET",
                callback_data:
                  "track_wallet",
              },
            ],
            [
              {
                text: "🏠 HOME",
                callback_data:
                  "home",
              },
            ],
          ],
        },
      },
    );
  },
);

/*
|--------------------------------------------------------------------------
| ALERT CALLBACKS
|--------------------------------------------------------------------------
*/

bot.action(
  "alerts",
  async (ctx) => {
    await ctx.answerCbQuery();

    await ctx.editMessageText(
      `🔔 <b>ALERTS</b>

Control your ERROR404 market signals.`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🔔 ENABLE",
                callback_data:
                  "alerts_on",
              },
              {
                text: "🔕 DISABLE",
                callback_data:
                  "alerts_off",
              },
            ],
            [
              {
                text: "🏠 HOME",
                callback_data:
                  "home",
              },
            ],
          ],
        },
      },
    );
  },
);

bot.action(
  "alerts_on",
  async (ctx) => {
    const userId =
      userIdFromContext(ctx);

    if (!userId) return;

    subscribe(userId);

    await ctx.answerCbQuery(
      "Alerts enabled",
    );

    await ctx.editMessageText(
      `🔔 <b>ALERTS ENABLED</b>

ERROR404 will send qualifying market signals here.`,
      {
        parse_mode: "HTML",
        reply_markup:
          backHome(),
      },
    );
  },
);

bot.action(
  "alerts_off",
  async (ctx) => {
    const userId =
      userIdFromContext(ctx);

    if (!userId) return;

    unsubscribe(userId);

    await ctx.answerCbQuery(
      "Alerts disabled",
    );

    await ctx.editMessageText(
      `🔕 <b>ALERTS DISABLED</b>`,
      {
        parse_mode: "HTML",
        reply_markup:
          backHome(),
      },
    );
  },
);

/*
|--------------------------------------------------------------------------
| TOKEN BUY BUTTON
|--------------------------------------------------------------------------
*/

bot.action(
  /^tokenbuy:(.+):(.+)$/,
  async (ctx) => {
    const match =
      ctx.match as RegExpMatchArray;

    const address =
      match[1];

    const amount =
      match[2];

    const userId =
      userIdFromContext(ctx);

    if (!userId) return;

    await ctx.answerCbQuery();

    const token =
      await getToken(address);

    if (!token) {
      await ctx.reply(
        "❌ Token could not be loaded.",
      );

      return;
    }

    await ctx.reply(
      `⚡ <b>BUY PREVIEW</b>

━━━━━━━━━━━━━━━━

<b>$${token.symbol}</b>

Amount:
<b>${amount} ETH</b>

Price:
$${token.price}

Liquidity:
${money(
        token.liquidity,
      )}

Momentum:
${scoreBar(
        token.momentumScore,
      )}

Smart Money:
${scoreBar(
        token.smartMoneyScore,
      )}

Risk:
${token.riskScore}/100

━━━━━━━━━━━━━━━━

Trade Guard will run before execution.`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "✅ CONFIRM BUY",
                callback_data:
                  `preparebuy:${address}:${amount}`,
              },
            ],
            [
              {
                text: "❌ CANCEL",
                callback_data:
                  "home",
              },
            ],
          ],
        },
      },
    );
  },
);

/*
|--------------------------------------------------------------------------
| PREPARE BUY
|--------------------------------------------------------------------------
*/

bot.action(
  /^preparebuy:(.+):(.+)$/,
  async (ctx) => {
    const match =
      ctx.match as RegExpMatchArray;

    const address =
      match[1];

    const amount =
      match[2];

    const userId =
      userIdFromContext(ctx);

    if (!userId) return;

    const token =
      await getToken(address);

    if (!token) {
      await ctx.answerCbQuery(
        "Token unavailable",
      );

      return;
    }

    await ctx.answerCbQuery(
      "Running Trade Guard...",
    );

    const {
      createConfirmation,
    } =
      await import(
        "./services/confirmation"
      );

    createConfirmation({
      userId,
      tokenAddress:
        token.address,
      symbol:
        token.symbol,
      side: "BUY",
      amountEth: amount,
      expiresAt:
        Date.now() + 30_000,
    });

    await ctx.editMessageText(
      `🛡️ <b>TRADE GUARD</b>

<b>$${token.symbol}</b>

Amount:
${amount} ETH

━━━━━━━━━━━━━━━━

Momentum:
${token.momentumScore}/100

Smart Money:
${token.smartMoneyScore}/100

Liquidity:
${token.liquidityScore}/100

Risk:
${token.riskScore}/100

━━━━━━━━━━━━━━━━

Final confirmation required.`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "⚡ EXECUTE",
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
  },
);

/*
|--------------------------------------------------------------------------
| SELL CALLBACK
|--------------------------------------------------------------------------
*/

bot.action(
  /^tokensell:(.+)$/,
  async (ctx) => {
    const address =
      (ctx.match as RegExpMatchArray)[1];

    await ctx.answerCbQuery();

    await ctx.reply(
      `📉 <b>SELL</b>

Token:

<code>${address}</code>

Choose percentage:`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "25%",
                callback_data:
                  `sellpct:${address}:25`,
              },
              {
                text: "50%",
                callback_data:
                  `sellpct:${address}:50`,
              },
            ],
            [
              {
                text: "75%",
                callback_data:
                  `sellpct:${address}:75`,
              },
              {
                text: "100%",
                callback_data:
                  `sellpct:${address}:100`,
              },
            ],
          ],
        },
      },
    );
  },
);

/*
|--------------------------------------------------------------------------
| TRACK WALLET
|--------------------------------------------------------------------------
*/

bot.action(
  "track_wallet",
  async (ctx) => {
    await ctx.answerCbQuery();

    await ctx.reply(
      `🐋 <b>TRACK SMART-MONEY WALLET</b>

Send the wallet address you want ERROR404 to monitor.`,
      {
        parse_mode: "HTML",
      },
    );
  },
);

/*
|--------------------------------------------------------------------------
| TEXT ROUTER
|--------------------------------------------------------------------------
*/

bot.on(
  "text",
  async (ctx) => {
    const text =
      ctx.message.text.trim();

    if (text.startsWith("/")) {
      return;
    }

    if (
      validateAddress(text)
    ) {
      const token =
        await getToken(text);

      if (!token) {
        await ctx.reply(
          `🔎 Address detected:

<code>${text}</code>

But token data is not available yet.`,
          {
            parse_mode: "HTML",
          },
        );

        return;
      }

      const analysis =
        await analyzeToken(text);

      if (!analysis) {
        await ctx.reply(
          "Unable to analyze token.",
        );

        return;
      }

      await ctx.reply(
        `🔎 <b>ERROR404 ANALYSIS</b>

<b>$${token.symbol}</b>

${token.name}

━━━━━━━━━━━━━━━━

Price
$${token.price}

Market Cap
${money(
          token.marketCap,
        )}

Liquidity
${money(
          token.liquidity,
        )}

24H Volume
${money(
          token.volume24h,
        )}

━━━━━━━━━━━━━━━━

🔥 Momentum
${scoreBar(
          token.momentumScore,
        )}

🐋 Smart Money
${scoreBar(
          token.smartMoneyScore,
        )}

💧 Liquidity
${scoreBar(
          token.liquidityScore,
        )}

🛡 Risk
${scoreBar(
          100 -
            token.riskScore,
        )}

━━━━━━━━━━━━━━━━

<b>ERROR404 SCORE:
${analysis.score}/100</b>`,
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
                  text: "📉 SELL",
                  callback_data:
                    `tokensell:${token.address}`,
                },
              ],
              [
                {
                  text: "🎯 SNIPER",
                  callback_data:
                    `snipertoken:${token.address}`,
                },
                {
                  text: "🤖 AUTOPILOT",
                  callback_data:
                    `autotoken:${token.address}`,
                },
              ],
              [
                {
                  text: "🏠 HOME",
                  callback_data:
                    "home",
                },
              ],
            ],
          },
        },
      );

      return;
    }

    if (
      text.length >= 2
    ) {
      const results =
        await searchTokens(text);

      if (!results.length) {
        await ctx.reply(
          `No tokens found for:

<b>${text}</b>`,
          {
            parse_mode: "HTML",
            reply_markup:
              backHome(),
          },
        );

        return;
      }

      await ctx.reply(
        `🔎 <b>SEARCH RESULTS</b>

${results
  .slice(0, 5)
  .map(
    (token, index) =>
      `${index + 1}. <b>$${token.symbol}</b>
${token.name}
Liquidity: ${money(
        token.liquidity,
      )}`,
  )
  .join("\n\n")}`,
        {
          parse_mode: "HTML",
          reply_markup:
            backHome(),
        },
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| CONFIRM / CANCEL
|--------------------------------------------------------------------------
*/

bot.action(
  "confirm_trade",
  confirmTrade,
);

bot.action(
  "cancel_trade",
  cancelTrade,
);

/*
|--------------------------------------------------------------------------
| ERROR HANDLING
|--------------------------------------------------------------------------
*/

bot.catch(
  async (error) => {
    logger.error(
      "Telegram bot error",
      error,
    );
  },
);

/*
|--------------------------------------------------------------------------
| START BOT
|--------------------------------------------------------------------------
*/

async function main() {
  try {
    logger.info(
      "Starting ERROR404 bot...",
    );

    await bot.launch();

    logger.info(
      "ERROR404 Telegram bot is running",
    );
  } catch (error) {
    logger.error(
      "Failed to start bot",
      error,
    );

    process.exit(1);
  }
}

/*
|--------------------------------------------------------------------------
| Graceful shutdown
|--------------------------------------------------------------------------
*/

process.once(
  "SIGINT",
  () => bot.stop("SIGINT"),
);

process.once(
  "SIGTERM",
  () => bot.stop("SIGTERM"),
);

main();

import "dotenv/config";
import { Telegraf } from "telegraf";

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  throw new Error("TELEGRAM_BOT_TOKEN is missing");
}

const bot = new Telegraf(token);

bot.start(async (ctx) => {
  await ctx.reply(
    `ERROR404 ⚡

Robinhood Chain Trading Bot

Fast execution.
Smart-money intelligence.
Automated trading.

Choose an option below.`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "⚡ TRADE", callback_data: "trade" },
            { text: "🔎 SCAN", callback_data: "scan" }
          ],
          [
            { text: "📊 POSITIONS", callback_data: "positions" },
            { text: "🎯 SNIPER", callback_data: "sniper" }
          ],
          [
            { text: "🤖 AUTOPILOT", callback_data: "autopilot" },
            { text: "🐋 SMART MONEY", callback_data: "smart_money" }
          ],
          [
            { text: "📋 ORDERS", callback_data: "orders" },
            { text: "🔔 ALERTS", callback_data: "alerts" }
          ],
          [
            { text: "💼 WALLET", callback_data: "wallet" },
            { text: "⚙️ SETTINGS", callback_data: "settings" }
          ]
        ]
      }
    }
  );
});

bot.action("trade", async (ctx) => {
  await ctx.answerCbQuery();

  await ctx.editMessageText(
    `⚡ TRADE

Send a Robinhood Chain token address to analyze it.

Quick Buy:

Choose an amount below.`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "0.01 ETH", callback_data: "buy:0.01" },
            { text: "0.05 ETH", callback_data: "buy:0.05" }
          ],
          [
            { text: "0.10 ETH", callback_data: "buy:0.10" },
            { text: "0.25 ETH", callback_data: "buy:0.25" }
          ],
          [
            { text: "💰 CUSTOM", callback_data: "custom_buy" }
          ],
          [
            { text: "🏠 HOME", callback_data: "home" }
          ]
        ]
      }
    }
  );
});

bot.action("scan", async (ctx) => {
  await ctx.answerCbQuery();

  await ctx.editMessageText(
    `🔎 SCAN

Send a token address or symbol.

ERROR404 will analyze:

• Momentum
• Liquidity
• Volume
• Smart money
• Holder concentration
• Risk
• Trade score`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🏠 HOME", callback_data: "home" }]
        ]
      }
    }
  );
});

bot.action("positions", async (ctx) => {
  await ctx.answerCbQuery();

  await ctx.editMessageText(
    `📊 POSITIONS

No positions yet.

Your open trades will appear here.`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "⚡ TRADE", callback_data: "trade" }
          ],
          [
            { text: "🏠 HOME", callback_data: "home" }
          ]
        ]
      }
    }
  );
});

bot.action("sniper", async (ctx) => {
  await ctx.answerCbQuery();

  await ctx.editMessageText(
    `🎯 SMART SNIPER

Status: ⚪ OFF

Filters:

MC < $1M
Liquidity > $50K
Risk < 30
Score > 85
Smart Money > 80

Buy size:
0.10 ETH`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "🚀 START SNIPER", callback_data: "start_sniper" }
          ],
          [
            { text: "⚙️ CONFIGURE", callback_data: "sniper_config" }
          ],
          [
            { text: "🏠 HOME", callback_data: "home" }
          ]
        ]
      }
    }
  );
});

bot.action("autopilot", async (ctx) => {
  await ctx.answerCbQuery();

  await ctx.editMessageText(
    `🤖 AUTOPILOT

Status: ⚪ OFF

ERROR404 can automatically:

• Find setups
• Analyze risk
• Simulate trades
• Enter positions
• Manage TP
• Manage SL
• Trail profits`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "🚀 START", callback_data: "start_autopilot" }
          ],
          [
            { text: "⚙️ CONFIGURE", callback_data: "autopilot_config" }
          ],
          [
            { text: "🏠 HOME", callback_data: "home" }
          ]
        ]
      }
    }
  );
});

bot.action("smart_money", async (ctx) => {
  await ctx.answerCbQuery();

  await ctx.editMessageText(
    `🐋 SMART MONEY

Live wallet activity.

ERROR404 will track:

• Whale buys
• Whale sells
• Accumulation
• Distribution
• Wallet clusters
• Smart-money flow`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "🐋 TRACK WALLET", callback_data: "track_wallet" }
          ],
          [
            { text: "📋 COPY WALLET", callback_data: "copy_wallet" }
          ],
          [
            { text: "🏠 HOME", callback_data: "home" }
          ]
        ]
      }
    }
  );
});

bot.action("orders", async (ctx) => {
  await ctx.answerCbQuery();

  await ctx.editMessageText(
    `📋 ORDERS

No active orders.

Supported order engine:

• Limit
• Stop loss
• Take profit
• Trailing stop
• DCA
• Conditional`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "➕ CREATE ORDER", callback_data: "create_order" }
          ],
          [
            { text: "🏠 HOME", callback_data: "home" }
          ]
        ]
      }
    }
  );
});

bot.action("alerts", async (ctx) => {
  await ctx.answerCbQuery();

  await ctx.editMessageText(
    `🔔 ALERTS

🐋 Whale alerts     🟢
🚀 Momentum         🟢
💧 Liquidity        🟢
🎯 Price            🟢
🛡 Risk             🟢`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "⚙️ CONFIGURE", callback_data: "alert_config" }
          ],
          [
            { text: "🏠 HOME", callback_data: "home" }
          ]
        ]
      }
    }
  );
});

bot.action("wallet", async (ctx) => {
  await ctx.answerCbQuery();

  await ctx.editMessageText(
    `💼 WALLET

Balance

0 ETH

Wallet
Not connected

🔐 Private keys are never displayed.`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "🔗 CONNECT WALLET", callback_data: "connect_wallet" }
          ],
          [
            { text: "🏠 HOME", callback_data: "home" }
          ]
        ]
      }
    }
  );
});

bot.action("settings", async (ctx) => {
  await ctx.answerCbQuery();

  await ctx.editMessageText(
    `⚙️ SETTINGS

Trading
• Slippage
• Priority
• Buy amount
• Sell settings

Automation
• Sniper
• Autopilot
• Copy trading

Security
• Wallet
• Confirmation
• PIN`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "⚡ TRADING", callback_data: "trading_settings" }
          ],
          [
            { text: "🤖 AUTOMATION", callback_data: "automation_settings" }
          ],
          [
            { text: "🔐 SECURITY", callback_data: "security" }
          ],
          [
            { text: "🏠 HOME", callback_data: "home" }
          ]
        ]
      }
    }
  );
});

bot.action("home", async (ctx) => {
  await ctx.answerCbQuery();

  await ctx.editMessageText(
    `ERROR404 ⚡

Robinhood Chain Trading Bot

💰 Balance
0 ETH

🤖 Automation
All systems offline

Select an operation.`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "⚡ TRADE", callback_data: "trade" },
            { text: "🔎 SCAN", callback_data: "scan" }
          ],
          [
            { text: "📊 POSITIONS", callback_data: "positions" },
            { text: "🎯 SNIPER", callback_data: "sniper" }
          ],
          [
            { text: "🤖 AUTOPILOT", callback_data: "autopilot" },
            { text: "🐋 SMART MONEY", callback_data: "smart_money" }
          ],
          [
            { text: "📋 ORDERS", callback_data: "orders" },
            { text: "🔔 ALERTS", callback_data: "alerts" }
          ],
          [
            { text: "💼 WALLET", callback_data: "wallet" },
            { text: "⚙️ SETTINGS", callback_data: "settings" }
          ]
        ]
      }
    }
  );
});

bot.action(/^buy:(.+)$/, async (ctx) => {
  await ctx.answerCbQuery();

  const amount = ctx.match[1];

  await ctx.reply(
    `⚡ BUY

Amount:
${amount} ETH

Send the token contract address to continue.`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "❌ CANCEL", callback_data: "home" }
          ]
        ]
      }
    }
  );
});

bot.action("custom_buy", async (ctx) => {
  await ctx.answerCbQuery();

  await ctx.reply(
    `💰 CUSTOM BUY

Send the ETH amount.

Example:

0.15`
  );
});

bot.action("start_sniper", async (ctx) => {
  await ctx.answerCbQuery("Sniper starting...");

  await ctx.editMessageText(
    `🎯 SMART SNIPER

Status: 🟢 ACTIVE

ERROR404 is scanning Robinhood Chain.

You will receive a Telegram alert when a token matches the strategy.`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "⏹ STOP", callback_data: "stop_sniper" }
          ],
          [
            { text: "🏠 HOME", callback_data: "home" }
          ]
        ]
      }
    }
  );
});

bot.action("stop_sniper", async (ctx) => {
  await ctx.answerCbQuery("Sniper stopped");

  await ctx.editMessageText(
    `🎯 SMART SNIPER

Status: ⚪ OFF`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "🚀 START", callback_data: "start_sniper" }
          ],
          [
            { text: "🏠 HOME", callback_data: "home" }
          ]
        ]
      }
    }
  );
});

bot.action("start_autopilot", async (ctx) => {
  await ctx.answerCbQuery("Autopilot starting...");

  await ctx.editMessageText(
    `🤖 AUTOPILOT

Status: 🟢 ACTIVE

ERROR404 is monitoring the market.

No trade will execute until the configured conditions pass.`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "🛑 STOP", callback_data: "stop_autopilot" }
          ],
          [
            { text: "🏠 HOME", callback_data: "home" }
          ]
        ]
      }
    }
  );
});

bot.action("stop_autopilot", async (ctx) => {
  await ctx.answerCbQuery("Autopilot stopped");

  await ctx.editMessageText(
    `🤖 AUTOPILOT

Status: ⚪ OFF`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "🚀 START", callback_data: "start_autopilot" }
          ],
          [
            { text: "🏠 HOME", callback_data: "home" }
          ]
        ]
      }
    }
  );
});

bot.action(/.*/, async (ctx) => {
  await ctx.answerCbQuery("Coming soon");
});

bot.launch().then(() => {
  console.log("ERROR404 Telegram bot is running");
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

export const homeKeyboard = {
  inline_keyboard: [
    [
      {
        text: "⚡ TRADE",
        callback_data: "trade",
      },
      {
        text: "🔎 SCAN",
        callback_data: "scan",
      },
    ],
    [
      {
        text: "📊 POSITIONS",
        callback_data: "positions",
      },
      {
        text: "🎯 SNIPER",
        callback_data: "sniper",
      },
    ],
    [
      {
        text: "🤖 AUTOPILOT",
        callback_data: "autopilot",
      },
      {
        text: "🐋 SMART MONEY",
        callback_data: "smart_money",
      },
    ],
    [
      {
        text: "📋 ORDERS",
        callback_data: "orders",
      },
      {
        text: "🔔 ALERTS",
        callback_data: "alerts",
      },
    ],
    [
      {
        text: "💼 WALLET",
        callback_data: "wallet",
      },
      {
        text: "⚙️ SETTINGS",
        callback_data: "settings",
      },
    ],
  ],
};

export function backHome() {
  return {
    inline_keyboard: [
      [
        {
          text: "🏠 HOME",
          callback_data: "home",
        },
      ],
    ],
  };
}

export function buyButtons(
  address: string,
) {
  return {
    inline_keyboard: [
      [
        {
          text: "⚡ 0.05 ETH",
          callback_data:
            `tokenbuy:${address}:0.05`,
        },
        {
          text: "⚡ 0.10 ETH",
          callback_data:
            `tokenbuy:${address}:0.10`,
        },
      ],
      [
        {
          text: "⚡ 0.25 ETH",
          callback_data:
            `tokenbuy:${address}:0.25`,
        },
      ],
      [
        {
          text: "💰 CUSTOM",
          callback_data:
            `customtokenbuy:${address}`,
        },
      ],
      [
        {
          text: "📉 SELL",
          callback_data:
            `tokensell:${address}`,
        },
      ],
      [
        {
          text: "🎯 SNIPER",
          callback_data:
            `snipertoken:${address}`,
        },
      ],
      [
        {
          text: "🤖 AUTOPILOT",
          callback_data:
            `autotoken:${address}`,
        },
      ],
      [
        {
          text: "🏠 HOME",
          callback_data: "home",
        },
      ],
    ],
  };
}

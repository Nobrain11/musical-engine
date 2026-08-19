import { Context } from "telegraf";

import {
  importWallet,
} from "../services/wallet";

import {
  validateAddress,
} from "../utils/validation";

const awaitingImport =
  new Set<number>();

export function beginWalletImport(
  userId: number,
) {
  awaitingImport.add(userId);
}

export function isAwaitingWalletImport(
  userId: number,
) {
  return awaitingImport.has(userId);
}

export function clearWalletImport(
  userId: number,
) {
  awaitingImport.delete(userId);
}

export async function handleWalletImport(
  ctx: Context,
) {
  const userId =
    ctx.from?.id;

  if (!userId) return;

  if (
    !("text" in ctx.message!)
  ) {
    return;
  }

  const privateKey =
    ctx.message.text.trim();

  try {
    if (
      !privateKey.startsWith("0x") ||
      privateKey.length !== 66
    ) {
      await ctx.reply(
        "❌ Invalid private key format.",
      );

      return;
    }

    const wallet =
      await importWallet(
        userId,
        privateKey,
      );

    clearWalletImport(userId);

    await ctx.reply(
      `✅ <b>WALLET IMPORTED</b>

Address:

<code>${wallet.address}</code>

🔐 Private key encrypted.

⚠️ Delete the private key message
from your Telegram chat history.`,
      {
        parse_mode: "HTML",
      },
    );
  } catch {
    await ctx.reply(
      "❌ Wallet import failed.",
    );
  }
}

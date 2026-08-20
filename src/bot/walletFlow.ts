import {
  Context,
} from "telegraf";

import {
  importWallet,
} from "../services/wallet";

const awaitingImport =
  new Set<number>();

export function beginWalletImport(
  userId: number,
): void {
  awaitingImport.add(userId);
}

export function isAwaitingWalletImport(
  userId: number,
): boolean {
  return awaitingImport.has(userId);
}

export function clearWalletImport(
  userId: number,
): void {
  awaitingImport.delete(userId);
}

export async function handleWalletImport(
  ctx: Context,
): Promise<void> {
  const userId =
    ctx.from?.id;

  if (!userId) {
    return;
  }

  const message =
    ctx.message;

  if (
    !message ||
    !("text" in message)
  ) {
    return;
  }

  const secret =
    message.text.trim();

  if (!secret) {
    await ctx.reply(
      "❌ Wallet secret is required.",
    );

    return;
  }

  try {
    const wallet =
      await Promise.resolve(
        importWallet(
          userId,
          "Imported",
          secret,
        ),
      );

    clearWalletImport(
      userId,
    );

    await ctx.reply(
      `✅ <b>WALLET IMPORTED</b>

Address:

<code>${wallet.address}</code>

🔐 Wallet credentials are encrypted.

⚠️ Delete the private key or seed phrase
message from your Telegram chat history.`,
      {
        parse_mode: "HTML",
      },
    );
  } catch {
    await ctx.reply(
      "❌ Wallet import failed. Check the private key or seed phrase and try again.",
    );
  }
}

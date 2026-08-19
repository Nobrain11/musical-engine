import { ethers } from 'ethers';
import { prisma } from './prisma';
import { encrypt, decrypt } from './crypto';
import { RPC_URL } from './chain';

export async function createWallet(userId: number): Promise<{ address: string; privateKey: string; mnemonic?: string }> {
  const hdWallet = ethers.Wallet.createRandom();
  const wallet = new ethers.Wallet(hdWallet.privateKey);
  const address = wallet.address;
  const privateKey = wallet.privateKey;
  const mnemonic = hdWallet.mnemonic?.phrase;

  const encryptedKey = encrypt(privateKey);
  const encryptedPhrase = mnemonic ? encrypt(mnemonic) : null;

  await prisma.wallet.create({
    data: {
      userId,
      address,
      encryptedKey,
      encryptedPhrase,
    },
  });

  return { address, privateKey, mnemonic };
}

export async function importWallet(userId: number, privateKeyOrPhrase: string): Promise<{ address: string; privateKey: string; mnemonic?: string }> {
  const input = privateKeyOrPhrase.trim();
  let wallet: ethers.Wallet;
  let mnemonic: string | undefined;

  const words = input.split(/\s+/).filter(w => w.length > 0);
  const isMnemonic = words.length >= 12 && words.every(w => /^[a-zA-Z]+$/.test(w));

  if (isMnemonic) {
    try {
      const hdWallet = ethers.HDNodeWallet.fromPhrase(input);
      wallet = new ethers.Wallet(hdWallet.privateKey);
      mnemonic = input;
    } catch (e) {
      throw new Error('Invalid mnemonic phrase');
    }
  } else {
    const clean = input.replace(/^0x/, '');
    if (!/^[0-9a-fA-F]{64}$/.test(clean)) {
      throw new Error('Invalid private key (must be 64 hex characters)');
    }
    try {
      wallet = new ethers.Wallet('0x' + clean);
    } catch (e) {
      throw new Error('Invalid private key');
    }
  }

  const address = wallet.address;
  const privateKey = wallet.privateKey;
  const encryptedKey = encrypt(privateKey);
  const encryptedPhrase = mnemonic ? encrypt(mnemonic) : null;

  await prisma.wallet.create({
    data: {
      userId,
      address,
      encryptedKey,
      encryptedPhrase,
    },
  });

  return { address, privateKey, mnemonic };
}

export async function getWalletAddress(userId: number): Promise<string | null> {
  const wallet = await prisma.wallet.findFirst({ where: { userId } });
  return wallet?.address || null;
}

export async function getDecryptedPrivateKey(userId: number): Promise<string | null> {
  const wallet = await prisma.wallet.findFirst({ where: { userId } });
  if (!wallet) return null;
  return decrypt(wallet.encryptedKey);
}

export async function getDecryptedPhrase(userId: number): Promise<string | null> {
  const wallet = await prisma.wallet.findFirst({ where: { userId } });
  if (!wallet || !wallet.encryptedPhrase) return null;
  return decrypt(wallet.encryptedPhrase);
}

export async function getEthBalance(address: string): Promise<string> {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch {
    return '0';
  }
}

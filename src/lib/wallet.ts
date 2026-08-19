import crypto from 'crypto';
import { ethers } from 'ethers';
import { prisma } from './prisma';
import { RPC_URL } from './constants';

const ENCRYPTION_KEY = process.env.WALLET_ENCRYPTION_KEY!;
const ALGORITHM = 'aes-256-gcm';

function getKey(): Buffer {
  if (ENCRYPTION_KEY.length === 64) {
    return Buffer.from(ENCRYPTION_KEY, 'hex');
  }
  return Buffer.from(ENCRYPTION_KEY, 'base64');
}

function encrypt(text: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString('hex');
}

function decrypt(encryptedHex: string): string {
  const key = getKey();
  const data = Buffer.from(encryptedHex, 'hex');
  const iv = data.subarray(0, 16);
  const authTag = data.subarray(16, 32);
  const encrypted = data.subarray(32);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  return decipher.update(encrypted) + decipher.final('utf8');
}

export function encryptPrivateKey(privateKey: string): string {
  return encrypt(privateKey);
}

export function decryptPrivateKey(encrypted: string): string {
  return decrypt(encrypted);
}

export function encryptPhrase(phrase: string): string {
  return encrypt(phrase);
}

export function decryptPhrase(encrypted: string): string {
  return decrypt(encrypted);
}

export async function createWallet(userId: number): Promise<{ address: string; privateKey: string; mnemonic?: string }> {
  const hdWallet = ethers.Wallet.createRandom();
  const wallet = new ethers.Wallet(hdWallet.privateKey);
  const address = wallet.address;
  const privateKey = wallet.privateKey;
  const mnemonic = hdWallet.mnemonic?.phrase;

  const encryptedKey = encryptPrivateKey(privateKey);
  const encryptedPhrase = mnemonic ? encryptPhrase(mnemonic) : null;

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
  const encryptedKey = encryptPrivateKey(privateKey);
  const encryptedPhrase = mnemonic ? encryptPhrase(mnemonic) : null;

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

export async function getEthBalance(address: string): Promise<string> {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch {
    return '0';
  }
}

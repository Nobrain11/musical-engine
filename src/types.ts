export type WalletSource =
  | "GENERATED"
  | "PRIVATE_KEY"
  | "SEED_PHRASE";

export interface StoredWallet {
  id: string;
  userId: number;
  name: string;
  address: string;

  encryptedPrivateKey: string;

  encryptedMnemonic?: string | null;

  source: WalletSource;

  createdAt: number;
  updatedAt: number;
}

export interface WalletSummary {
  id: string;
  name: string;
  address: string;
  source: WalletSource;
  createdAt: number;
}

export interface WalletCredentials {
  privateKey: string;
  mnemonic?: string;
}

export interface UserWalletState {
  userId: number;

  wallets: StoredWallet[];

  activeWalletId?: string;

  updatedAt: number;
}

export interface TradePreferences {
  userId: number;

  activeWalletId?: string;

  defaultBuyEth: string;

  defaultSellPercent: number;

  slippage: number;

  gasMode:
    | "AUTO"
    | "FAST"
    | "CUSTOM";

  mevProtection: boolean;

  confirmationMode:
    | "ALWAYS"
    | "SMART"
    | "OFF";

  updatedAt: number;
}

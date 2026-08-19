import { ethers } from 'ethers';
import { UNIVERSAL_ROUTER, BAGS_LENS_ADDRESS, WETH_ADDRESS, RPC_URL } from './chain';
import { getDecryptedPrivateKey } from './wallet';

const ROUTER_ABI = [
  'function swap((bytes commands, bytes[] inputs, uint256 deadline)) external payable',
];

const BAGS_LENS_ABI = [
  'function getTokenState(address token) external view returns (uint8, bool, uint256, uint256, uint256, uint256)',
];

export async function getTokenState(tokenCa: string) {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const lens = new ethers.Contract(BAGS_LENS_ADDRESS, BAGS_LENS_ABI, provider);
  const result = await lens.getTokenState(tokenCa);
  return {
    state: result[0],
    graduated: result[1],
    mcap: ethers.formatEther(result[2]),
    liq: ethers.formatEther(result[3]),
    volume: ethers.formatEther(result[4]),
    price: ethers.formatEther(result[5]),
  };
}

export async function executeSwap(
  userId: number,
  tokenCa: string,
  amount: string,
  isBuy: boolean,
  minAmount: string,
  slippage: number
) {
  const privateKey = await getDecryptedPrivateKey(userId);
  if (!privateKey) throw new Error('No wallet found');
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(privateKey, provider);
  const address = await wallet.getAddress();

  const amountIn = ethers.parseEther(amount);
  const minOut = ethers.parseEther(minAmount);
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

  // Check token state
  const state = await getTokenState(tokenCa);
  if (state.graduated) {
    // Use UniversalRouter
    const router = new ethers.Contract(UNIVERSAL_ROUTER, ROUTER_ABI, wallet);
    const tx = await router.swap(
      {
        commands: '0x00', // placeholder – need real commands
        inputs: [],
        deadline,
      },
      {
        value: isBuy ? amountIn : 0,
        gasLimit: 500000,
      }
    );
    const receipt = await tx.wait();
    return receipt;
  } else {
    // Use Bags bonding curve (simplified – real integration would call Bags contract)
    // For now, simulate
    throw new Error('Bags bonding curve not yet implemented in this bot version');
  }
}

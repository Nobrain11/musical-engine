import { ethers } from 'ethers';
import { RPC_URL } from './chain';

const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
];

export async function getTokenInfo(address: string) {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(address, ERC20_ABI, provider);
  try {
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.totalSupply(),
    ]);
    return { name, symbol, decimals, totalSupply: totalSupply.toString() };
  } catch {
    return null;
  }
}

export async function getTokenBalance(address: string, owner: string): Promise<string> {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(address, ERC20_ABI, provider);
  try {
    const balance = await contract.balanceOf(owner);
    return balance.toString();
  } catch {
    return '0';
  }
}

export async function approveToken(tokenAddress: string, spender: string, amount: string, signer: ethers.Signer) {
  const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
  const tx = await contract.approve(spender, amount);
  await tx.wait();
  return tx;
}

export async function getAllowance(tokenAddress: string, owner: string, spender: string): Promise<string> {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  try {
    const allowance = await contract.allowance(owner, spender);
    return allowance.toString();
  } catch {
    return '0';
  }
}

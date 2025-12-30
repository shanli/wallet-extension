import type { To } from "react-router-dom";

export interface WalletAccount {
  address: string;
  privateKey: string;
  name: string;
  index: number;
}

export interface WalletState {
  isLocked: boolean;
  isConnected: boolean;
  accounts: WalletAccount[];
  currentAccount: WalletAccount | null;
  mnemonic: string | null;
  password: string | null;
  currentNetwork: Network;
  networks: Network[];
  // tokens: Token[];
  tokens: {
    [key: string]: Token
  }
}

export interface Network {
  id: string;
  name: string;
  rpcUrl: string;
  chainId: number;
  symbol: string;
  blockExplorerUrl?: string;
}

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  type: 'ERC20' | 'ERC721' | 'ERC1155';
  balance?: string;
  tokenId?: string;
  image?: string;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasLimit: string;
  gasPrice: string;
  data?: string;
  type: 'send' | 'receive';
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: number;
  tokenAddress?: string;
  tokenSymbol?: string;
}

export interface DappRequest {
  id: string;
  method: string;
  params: any[];
  origin: string;
  timestamp: number;
}

// EIP-1102 types
export interface EthRequestAccountsParams {
  method: 'eth_requestAccounts';
  params: [];
}

// EIP-747 types
export interface WatchAssetParams {
  method: 'wallet_watchAsset';
  params: {
    type: 'ERC20' | 'ERC721' | 'ERC1155';
    options: {
      address: string;
      symbol: string;
      decimals?: number;
      image?: string;
      tokenId?: string;
    };
  };
}

export const DEFAULT_NETWORKS: Network[] = [
  {
    id: 'sepolia',
    name: 'Ethereum Sepolia Testnet',
    rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/Hqd_61uGu4Xbq16eZ2j5N',
    chainId: 11155111,
    symbol: 'ETH',
    blockExplorerUrl: 'https://sepolia.etherscan.io'
  },
  {
    id: 'ethereum',
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/Hqd_61uGu4Xbq16eZ2j5N',
    chainId: 1,
    symbol: 'ETH',
    blockExplorerUrl: 'https://etherscan.io'
  },
  {
    id: 'polygon',
    name: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-mainnet.g.alchemy.com/v2/Hqd_61uGu4Xbq16eZ2j5N',
    chainId: 137,
    symbol: 'POL',
    blockExplorerUrl: 'https://polygonscan.com'
  },
  {
    id: 'polygon-amoy',
    name: 'Polygon Amoy Testnet',
    rpcUrl: 'https://polygon-amoy.g.alchemy.com/v2/Hqd_61uGu4Xbq16eZ2j5N',
    chainId: 80002,
    symbol: 'POL',
    blockExplorerUrl: 'https://www.oklink.com/amoy'
  }
];
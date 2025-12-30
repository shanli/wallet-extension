import { useState, useEffect } from 'react';
import {formatUnits} from 'viem';
import useWalletStore from '@/stores';
import type { Token } from '@/types/wallet';

export const useWalletBalance = () => {
  const { currentAccount, currentNetwork, getClient, tokens, updateTokenBalance } = useWalletStore();
  const [ethBalance, setEthBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);

  const fetchEthBalance = async () => {
    if (!currentAccount || !currentNetwork) return;

    setIsLoading(true);
    try {
      const client = getClient();
      if (!client) return;
      // @ts-ignore
      const balance = await client.getBalance({address: currentAccount.address});
      
      setEthBalance(formatUnits(balance, 18));
    } catch (error) {
      console.error('Failed to fetch ETH balance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTokenBalance = async (token: Token) => {
    if (!currentAccount || !currentNetwork) return;

    try {
      const client = getClient();
      if (!client) return;

      if (token.type === 'ERC20') {
        const erc20Abi = [
          'function balanceOf(address owner) view returns (uint256)',
          'function decimals() view returns (uint8)'
        ];
        
        // const contract = new ethers.Contract(token.address, erc20Abi, provider);
       const balance20: bigint = await client.readContract({
        // @ts-ignore
          address: token.address,
          abi: erc20Abi,
          functionName: 'balanceOf'
        }) as bigint
        // const balance = await contract.balanceOf(currentAccount.address);
        // const formattedBalance = ethers.formatUnits(balance, token.decimals);
        const formattedBalance = formatUnits(balance20, token.decimals);
        updateTokenBalance(token.address, formattedBalance);
      } else if (token.type === 'ERC721') {
        const erc721Abi = [
          'function balanceOf(address owner) view returns (uint256)',
          'function ownerOf(uint256 tokenId) view returns (address)'
        ];
        const balance721: bigint = await client.readContract({
        // @ts-ignore
          address: token.address,
          abi: erc721Abi,
          functionName: 'balanceOf'
        }) as bigint
        
        const formattedBalance721 = formatUnits(balance721, token.decimals);
        updateTokenBalance(token.address, formattedBalance721);
      }
    } catch (error) {
      console.error(`Failed to fetch ${token.symbol} balance:`, error);
    }
  };

  const fetchAllTokenBalances = async () => {
    if (!tokens.length) return;

    setIsLoading(true);
    try {
      await Promise.all(tokens.map(token => fetchTokenBalance(token)));
    } catch (error) {
      console.error('Failed to fetch token balances:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshBalances = async () => {
    await Promise.all([
      fetchEthBalance(),
      fetchAllTokenBalances()
    ]);
  };

  useEffect(() => {
    if (currentAccount) {
      refreshBalances();
    }
  }, [currentAccount, currentNetwork]);

  return {
    ethBalance,
    isLoading,
    refreshBalances,
    fetchTokenBalance
  };
};
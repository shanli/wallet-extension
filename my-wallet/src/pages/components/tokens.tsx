import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import useWalletStore from '@/stores';
import type { Token } from '@/types/wallet';
import { ethers } from 'ethers';
import { Coins, Image, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useState } from 'react';

export const Tokens = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newToken, setNewToken] = useState<Partial<Token>>({
    address: '',
    symbol: '',
    name: '',
    decimals: 18,
    type: 'ERC20',
    image: '',
    tokenId: ''
  });
  const [isDetecting, setIsDetecting] = useState(false);

  const { currentAccount, tokens, addToken, removeToken, currentNetwork, getClient } = useWalletStore();
  const { fetchTokenBalance } = useWalletBalance();
  const { toast } = useToast();
  const readContractInfo = async (fnName, newToken, abi) => {
    const client = getClient();
    const name = client.readContract({
        // @ts-ignore
        address: newToken.address,
        abi,
        functionName: fnName,
        authorizationList: undefined
    })
  }
  const detectTokenInfo = async () => {
    if (!newToken.address || !ethers.isAddress(newToken.address)) {
      toast({
        title: "无效的合约地址",
        variant: "destructive"
      });
      return;
    }

    setIsDetecting(true);
    try {
      const client = getClient();
      if (!client) {
        throw new Error('无法连接到网络');
      }

      if (newToken.type === 'ERC20') {
        const erc20Abi = [
          'function name() view returns (string)',
          'function symbol() view returns (string)',
          'function decimals() view returns (uint8)'
        ];
        
        // const contract = new ethers.Contract(newToken.address, erc20Abi, client);
        // const name = client.readContract({

        // })
        // const [name, symbol, decimals] = await Promise.all([
        //   contract.name(),
        //   contract.symbol(),
        //   contract.decimals()
        // ]);

        const name = await readContractInfo('name', newToken, erc20Abi )
        const symbol = await readContractInfo('symbol', newToken, erc20Abi )
        const decimals = await readContractInfo('decimals', newToken, erc20Abi )
        // @ts-ignore
        setNewToken(prev => ({
          ...prev,
          name,
          symbol,
          decimals: Number(decimals)
        }));

        toast({
          title: "代币信息检测成功",
          description: `${symbol} (${name})`
        });
      } else if (newToken.type === 'ERC721') {
        const erc721Abi = [
          'function name() view returns (string)',
          'function symbol() view returns (string)'
        ];
        
        // const contract = new ethers.Contract(newToken.address, erc721Abi, provider);
        
        // const [name, symbol] = await Promise.all([
        //   contract.name(),
        //   contract.symbol()
        // ]);
        const name = await readContractInfo('name', newToken, erc721Abi )
        const symbol = await readContractInfo('symbol', newToken, erc721Abi )
        // @ts-ignore
        setNewToken(prev => ({
          ...prev,
          name,
          symbol,
          decimals: 0
        }));

        toast({
          title: "NFT信息检测成功",
          description: `${symbol} (${name})`
        });
      }
    } catch (error) {
      console.error('Token detection error:', error);
      toast({
        title: "检测失败",
        description: "无法获取代币信息，请手动填写",
        variant: "destructive"
      });
    } finally {
      setIsDetecting(false);
    }
  };

  const handleAddToken = async () => {
    if (!newToken.address || !newToken.symbol || !newToken.name) {
      toast({
        title: "请填写必填字段",
        description: "合约地址、符号和名称为必填项",
        variant: "destructive"
      });
      return;
    }

    if (!ethers.isAddress(newToken.address)) {
      toast({
        title: "无效的合约地址",
        variant: "destructive"
      });
      return;
    }

    const token: Token = {
      address: newToken.address!,
      symbol: newToken.symbol!,
      name: newToken.name!,
      decimals: newToken.decimals || (newToken.type === 'ERC20' ? 18 : 0),
      type: (newToken.type as 'ERC20' | 'ERC721' | 'ERC1155') || 'ERC20',
      image: newToken.image || undefined,
      tokenId: newToken.tokenId || undefined
    };

    try {
      addToken(token);
      
      // 获取余额
      await fetchTokenBalance(token);
      
      setIsAddDialogOpen(false);
      setNewToken({
        address: '',
        symbol: '',
        name: '',
        decimals: 18,
        type: 'ERC20',
        image: '',
        tokenId: ''
      });
      
      toast({
        title: "代币添加成功！",
        description: `${token.symbol} 已添加到代币列表`
      });
    } catch (error) {
      toast({
        title: "添加失败",
        description: "无法添加代币",
        variant: "destructive"
      });
    }
  };

  const handleRemoveToken = (address: string) => {
    try {
      removeToken(address);
      toast({
        title: "代币已移除"
      });
    } catch (error) {
      toast({
        title: "移除失败",
        variant: "destructive"
      });
    }
  };

  const handleRefreshBalance = async (token: Token) => {
    try {
      await fetchTokenBalance(token);
      toast({
        title: "余额已刷新",
        description: `${token.symbol} 余额已更新`
      });
    } catch (error) {
      toast({
        title: "刷新失败",
        description: "无法获取余额",
        variant: "destructive"
      });
    }
  };

  // EIP-747 wallet_watchAsset 实现
  const handleWatchAsset = async (token: Token) => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        await (window as any).ethereum.request({
          method: 'wallet_watchAsset',
          params: {
            type: token.type,
            options: {
              address: token.address,
              symbol: token.symbol,
              decimals: token.decimals,
              image: token.image
            }
          }
        });
        
        toast({
          title: "代币已添加到钱包",
          description: `${token.symbol} 已添加到MetaMask`
        });
      } catch (error) {
        console.error('Watch asset error:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">代币管理</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              添加代币
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>添加自定义代币</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tokenType">代币类型</Label>
                <Select 
                  value={newToken.type} 
                  onValueChange={(value) => setNewToken({ ...newToken, type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ERC20">ERC-20 代币</SelectItem>
                    <SelectItem value="ERC721">ERC-721 NFT</SelectItem>
                    <SelectItem value="ERC1155">ERC-1155</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tokenAddress">合约地址 *</Label>
                <div className="flex gap-2">
                  <Input
                    id="tokenAddress"
                    value={newToken.address}
                    onChange={(e) => setNewToken({ ...newToken, address: e.target.value })}
                    placeholder="0x..."
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={detectTokenInfo}
                    disabled={isDetecting || !newToken.address}
                  >
                    {isDetecting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      "检测"
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tokenSymbol">代币符号 *</Label>
                <Input
                  id="tokenSymbol"
                  value={newToken.symbol}
                  onChange={(e) => setNewToken({ ...newToken, symbol: e.target.value })}
                  placeholder="USDT"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tokenName">代币名称 *</Label>
                <Input
                  id="tokenName"
                  value={newToken.name}
                  onChange={(e) => setNewToken({ ...newToken, name: e.target.value })}
                  placeholder="Tether USD"
                />
              </div>
              
              {newToken.type === 'ERC20' && (
                <div className="space-y-2">
                  <Label htmlFor="tokenDecimals">小数位数</Label>
                  <Input
                    id="tokenDecimals"
                    type="number"
                    value={newToken.decimals || ''}
                    onChange={(e) => setNewToken({ ...newToken, decimals: parseInt(e.target.value) || 18 })}
                    placeholder="18"
                  />
                </div>
              )}

              {newToken.type === 'ERC721' && (
                <div className="space-y-2">
                  <Label htmlFor="tokenId">Token ID (可选)</Label>
                  <Input
                    id="tokenId"
                    value={newToken.tokenId}
                    onChange={(e) => setNewToken({ ...newToken, tokenId: e.target.value })}
                    placeholder="1"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="tokenImage">图标URL (可选)</Label>
                <Input
                  id="tokenImage"
                  value={newToken.image}
                  onChange={(e) => setNewToken({ ...newToken, image: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              
              <Button onClick={handleAddToken} className="w-full">
                <Coins className="w-4 h-4 mr-2" />
                添加代币
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {tokens?.[currentAccount.address]?.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Coins className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">暂无代币</h3>
            <p className="text-muted-foreground mb-4">
              添加ERC-20、ERC-721或ERC-1155代币来管理您的资产
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              添加第一个代币
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tokens?.[currentAccount.address]?.map((token) => (
            <Card key={token.address}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {token.image ? (
                      <img 
                        src={token.image} 
                        alt={token.symbol}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        {token.type === 'ERC721' ? (
                          <Image className="w-5 h-5" />
                        ) : (
                          <Coins className="w-5 h-5" />
                        )}
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{token.symbol}</div>
                      <div className="text-sm text-muted-foreground">{token.name}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="font-medium">
                        {token.balance || '0'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {token.type}
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRefreshBalance(token)}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveToken(token.address)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="mt-2 text-xs text-muted-foreground font-mono">
                  {token.address}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="text-sm text-muted-foreground">
        <p>• 支持 ERC-20、ERC-721 和 ERC-1155 标准</p>
        <p>• 请确保合约地址正确，在{currentNetwork.name}网络上有效</p>
        <p>• 添加代币前建议先使用"检测"功能自动获取信息</p>
      </div>
    </div>
  );
};
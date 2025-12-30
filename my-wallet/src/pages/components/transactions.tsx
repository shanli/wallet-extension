import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import  useWalletStore  from '@/stores';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { useToast } from '@/hooks/use-toast';
import { ethers } from 'ethers';
import { Send, ArrowRight, AlertTriangle, CheckCircle } from 'lucide-react';
import CryptoJS from 'crypto-js';
import { parseGwei, type ByteArray } from 'viem';

interface SendForm {
  to: string;
  amount: string;
  tokenAddress?: string;
  tokenId?: string;
  gasLimit?: string;
  gasPrice?: string;
}

export const Transactions = () => {
  const [form, setForm] = useState<SendForm>({
    to: '',
    amount: '',
    tokenAddress: '',
    tokenId: '',
    gasLimit: '21000',
    gasPrice: '20'
  });
  const [selectedAsset, setSelectedAsset] = useState<'ETH' | 'TOKEN'>('ETH');
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const { 
    currentAccount, 
    currentNetwork, 
    tokens, 
    getClient, 
    getwalletClient,
    isValidPassword 
  } = useWalletStore();
  const { ethBalance } = useWalletBalance();
  const { toast } = useToast();

  const selectedToken = tokens?.[currentAccount.address]?.find(token => token.address === form.tokenAddress);


  const [walletClient, setWalletClient] = useState(null);

// useEffect(() => {
//   const connectAndSetup = async () => {
//     // ... connection logic ...
//         if (ethereumProvider) {
       
//         }
//     };
//     connectAndSetup();
// }, []);

  const validateForm = () => {
    if (!ethers.isAddress(form.to)) {
      toast({
        title: "无效的接收地址",
        variant: "destructive"
      });
      return false;
    }

    if (!form.amount || parseFloat(form.amount) <= 0) {
      toast({
        title: "请输入有效金额",
        variant: "destructive"
      });
      return false;
    }

    // if (selectedAsset === 'ETH') {
    //   if (parseFloat(form.amount) > parseFloat(ethBalance)) {
    //     toast({
    //       title: "余额不足",
    //       description: "ETH余额不足",
    //       variant: "destructive"
    //     });
    //     return false;
    //   }
    // } else if (selectedToken) {
    //   const tokenBalance = parseFloat(selectedToken.balance || '0');
    //   if (selectedToken.type === 'ERC20' && parseFloat(form.amount) > tokenBalance) {
    //     toast({
    //       title: "余额不足",
    //       description: `${selectedToken.symbol}余额不足`,
    //       variant: "destructive"
    //     });
    //     return false;
    //   }
    // }

    return true;
  };

  const handleSend = async () => {
    if (!validateForm()) return;
    setIsConfirmDialogOpen(true);
  };

  const executeTransaction = async () => {
    if (!password) {
      toast({
        title: "请输入密码",
        variant: "destructive"
      });
      return;
    }

    if (!isValidPassword(password)) {
      toast({
        title: "密码错误",
        description: "请检查您的密码",
        variant: "destructive"
      });
      return;
    }

    if (!currentAccount) return;

    setIsSending(true);
    try {
      const walletClient = getwalletClient();
      if (!walletClient) {
        throw new Error('无法连接到网络');
      }

      // 解密私钥
      const decryptedPrivateKey = CryptoJS.AES.decrypt(
        currentAccount.privateKey,
        password
      ).toString(CryptoJS.enc.Utf8);

    //   const wallet = new ethers.Wallet(decryptedPrivateKey, provider);


      let tx;

      if (selectedAsset === 'ETH') {
        // 发送ETH
        // tx = await wallet.sendTransaction({
        //   to: form.to,
        //   value: ethers.parseEther(form.amount),
        //   gasLimit: form.gasLimit || '21000',
        //   gasPrice: ethers.parseUnits(form.gasPrice || '20', 'gwei')
        // });
        tx = await walletClient.sendTransaction({
            // @ts-ignore
            account: currentAccount.address,
            to: form.to,
            value: parseGwei(form.amount || '20'),//form.amount,
            gasLimit: form.gasLimit || '21000',
            gasPrice: ethers.parseUnits(form.gasPrice || '20', 'gwei'),
        })
      } else if (selectedToken) {
        if (selectedToken.type === 'ERC20') {
          // 发送ERC20代币
          const erc20Abi = [
            'function transfer(address to, uint256 amount) returns (bool)'
          ];
        //   const contract = new ethers.Contract(selectedToken.address, erc20Abi, wallet);
        //   const amount = ethers.parseUnits(form.amount, selectedToken.decimals);
          
        //   tx = await contract.transfer(form.to, amount, {
        //     gasLimit: form.gasLimit || '60000',
        //     gasPrice: ethers.parseUnits(form.gasPrice || '20', 'gwei')
        //   });
            tx = await walletClient.writeContract({
                // @ts-ignore
                address: selectedToken.address,
                // to: form.to,
                abi: erc20Abi,
                functionName:'transfer',
                args: [form.to,parseGwei(form.amount || '20')],
                // value: parseGwei(form.amount || '20'),//form.amount,
                // @ts-ignore
                account: currentAccount.address,
                // parseEther
                gasLimit: form.gasLimit || '100000',
                gasPrice: parseGwei(form.gasPrice || '20')
            })
        } else if (selectedToken.type === 'ERC721') {
          // 发送NFT
          if (!form.tokenId) {
            throw new Error('请输入Token ID');
          }
          
          const erc721Abi = [
            'function safeTransferFrom(address from, address to, uint256 tokenId)'
          ];
        //   const contract = new ethers.Contract(selectedToken.address, erc721Abi, wallet);
          
        //   tx = await contract.safeTransferFrom(
        //     currentAccount.address,
        //     form.to,
        //     form.tokenId,
        //     {
        //       gasLimit: form.gasLimit || '100000',
            //   gasPrice: ethers.parseUnits(form.gasPrice || '20', 'gwei')
        //     }
        //   );

          tx = await walletClient.writeContract({
            // @ts-ignore
            address: selectedToken.address,
            // to: form.to,
            abi: erc721Abi,
            functionName:'safeTransferFrom',
            args: [currentAccount.address, form.to, form.tokenId],
            // @ts-ignore
            // account: currentAccount.address,
            // parseEther
            gasLimit: form.gasLimit || '100000',
            gasPrice: parseGwei(form.gasPrice || '20')
          })

        }
      }

      if (tx) {
        setTxHash(tx.hash);
        toast({
          title: "交易已发送",
          description: `交易哈希: ${tx.hash}`
        });

        // 等待交易确认
        // await tx.wait();
        
        toast({
          title: "交易成功！",
          description: "交易已被确认"
        });
      }

    } catch (error: any) {
      console.error('Transaction error:', error);
      toast({
        title: "交易失败",
        description: error.message || "发送交易时出现错误",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
      setIsConfirmDialogOpen(false);
      setPassword('');
    }
  };

  const resetForm = () => {
    setForm({
      to: '',
      amount: '',
      tokenAddress: '',
      tokenId: '',
      gasLimit: '21000',
      gasPrice: '20'
    });
    setSelectedAsset('ETH');
    setTxHash(null);
  };

  const estimateGasFee = () => {
    const gasLimit = parseInt(form.gasLimit || '21000');
    const gasPrice = parseFloat(form.gasPrice || '20');
    return ((gasLimit * gasPrice) / 1e9).toFixed(6);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">发送交易</h2>
        {txHash && (
          <Button variant="outline" size="sm" onClick={resetForm}>
            新建交易
          </Button>
        )}
      </div>

      {txHash ? (
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-medium mb-2">交易已发送</h3>
            <p className="text-muted-foreground mb-4">
              您的交易正在被处理中
            </p>
            <div className="bg-muted p-3 rounded-lg font-mono text-sm break-all">
              {txHash}
            </div>
            {currentNetwork.blockExplorerUrl && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.open(`${currentNetwork.blockExplorerUrl}/tx/${txHash}`, '_blank')}
              >
                在区块浏览器中查看
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              发送 {selectedAsset === 'ETH' ? currentNetwork.symbol : selectedToken?.symbol}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 资产选择 */}
            <div className="space-y-2">
              <Label>选择资产</Label>
              <div className="flex gap-2">
                <Button
                  variant={selectedAsset === 'ETH' ? 'default' : 'outline'}
                  onClick={() => setSelectedAsset('ETH')}
                  className="flex-1"
                >
                  {currentNetwork.symbol}
                </Button>
                {tokens?.[currentAccount.address]?.length > 0 && (
                  <Select
                    value={selectedAsset === 'TOKEN' ? form.tokenAddress : ''}
                    onValueChange={(value) => {
                      setSelectedAsset('TOKEN');
                      setForm({ ...form, tokenAddress: value });
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="选择代币" />
                    </SelectTrigger>
                    <SelectContent>
                      {tokens?.[currentAccount.address]?.map((token) => (
                        <SelectItem key={token.address} value={token.address}>
                          {token.symbol} ({token.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {/* 接收地址 */}
            <div className="space-y-2">
              <Label htmlFor="to">接收地址</Label>
              <Input
                id="to"
                value={form.to}
                onChange={(e) => setForm({ ...form, to: e.target.value })}
                placeholder="0x..."
              />
            </div>

            {/* 金额 */}
            <div className="space-y-2">
              <Label htmlFor="amount">
                {selectedToken?.type === 'ERC721' ? 'Token ID' : '金额'}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="amount"
                  value={selectedToken?.type === 'ERC721' ? form.tokenId : form.amount}
                  onChange={(e) => {
                    if (selectedToken?.type === 'ERC721') {
                      setForm({ ...form, tokenId: e.target.value });
                    } else {
                      setForm({ ...form, amount: e.target.value });
                    }
                  }}
                  placeholder={selectedToken?.type === 'ERC721' ? '输入Token ID' : '0.0'}
                  type={selectedToken?.type === 'ERC721' ? 'text' : 'number'}
                  step="any"
                />
                {selectedAsset === 'ETH' ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setForm({ ...form, amount: ethBalance })}
                  >
                    全部
                  </Button>
                ) : selectedToken && selectedToken.type === 'ERC20' && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setForm({ ...form, amount: selectedToken.balance || '0' })}
                  >
                    全部
                  </Button>
                )}
              </div>
              {selectedAsset === 'ETH' && (
                <p className="text-sm text-muted-foreground">
                  余额: {parseFloat(ethBalance).toFixed(4)} {currentNetwork.symbol}
                </p>
              )}
              {selectedToken && (
                <p className="text-sm text-muted-foreground">
                  余额: {selectedToken.balance || '0'} {selectedToken.symbol}
                </p>
              )}
            </div>

            {/* Gas设置 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gasLimit">Gas Limit</Label>
                <Input
                  id="gasLimit"
                  value={form.gasLimit}
                  onChange={(e) => setForm({ ...form, gasLimit: e.target.value })}
                  placeholder="21000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gasPrice">Gas Price (Gwei)</Label>
                <Input
                  id="gasPrice"
                  value={form.gasPrice}
                  onChange={(e) => setForm({ ...form, gasPrice: e.target.value })}
                  placeholder="20"
                />
              </div>
            </div>

            {/* <div className="bg-muted p-3 rounded-lg">
              <div className="flex justify-between text-sm">
                <span>预估手续费:</span>
                <span>{estimateGasFee()} {currentNetwork.symbol}</span>
              </div>
            </div> */}

            <Button 
              onClick={handleSend} 
              className="w-full bg-wallet-gradient hover:opacity-90"
              disabled={!form.to || (!form.amount && !form.tokenId)}
            >
              <Send className="w-4 h-4 mr-2" />
              发送交易
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 确认对话框 */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              确认交易
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-[rgb(45,46,55)] p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">从:</span>
                <span className="font-mono text-sm">
                  {currentAccount?.address.slice(0, 6)}...{currentAccount?.address.slice(-4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">到:</span>
                <span className="font-mono text-sm">
                  {form.to.slice(0, 6)}...{form.to.slice(-4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">金额:</span>
                <span className="font-medium">
                  {selectedToken?.type === 'ERC721' 
                    ? `Token #${form.tokenId}`
                    : `${form.amount} ${selectedAsset === 'ETH' ? currentNetwork.symbol : selectedToken?.symbol}`
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">手续费:</span>
                <span>{estimateGasFee()} {currentNetwork.symbol}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认密码</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="输入钱包密码"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsConfirmDialogOpen(false);
                  setPassword('');
                }}
                className="flex-1"
              >
                取消
              </Button>
              <Button
                onClick={executeTransaction}
                disabled={isSending || !password}
                className="flex-1"
              >
                {isSending ? "发送中..." : "确认发送"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
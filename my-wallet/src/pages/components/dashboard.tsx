import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import  useWalletStore  from '@/stores';
// import logoImage from '@/static/logo.png';
import {
  Check,
  Coins,
  Copy,
  Eye,
  EyeOff,
  LogOut,
  Network,
  Plus,
  Send,
  Wallet
} from 'lucide-react';
import React, { useState } from 'react';
import { Accounts } from './accounts';
import { Networks } from './networks';
import { Transactions } from './transactions';
import { Tokens }  from './tokens';

export const Dashboard = () => {
  const [showBalance, setShowBalance] = useState(true);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'accounts' | 'networks' | 'tokens' | 'send'>('overview');
  const { currentAccount, currentNetwork, lockWallet, tokens, clearAccount } = useWalletStore();
//   const { currentAccount, currentNetwork, lockWallet, tokens, getMnemonic } = useWalletStore();
// const { currentAccount, currentNetwork, tokens } = useWalletStore();
  console.log(currentAccount);
  console.log(currentNetwork);
  
  
  const { ethBalance, isLoading, refreshBalances } = useWalletBalance();
  const { toast } = useToast();

  const copyAddress = async () => {
    if (currentAccount?.address) {
      await navigator.clipboard.writeText(currentAccount.address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
      toast({
        title: "地址已复制",
        description: "钱包地址已复制到剪贴板"
      });
    }
  };

  const exit = () => {
    clearAccount();
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!currentAccount) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[rgb(44,46,55)] rounded-full flex items-center justify-center">
              {/* <Wallet className="w-5 h-5 text-white" /> */}
              {/* <img src={logoImage} alt="MetaNodeWallet" className="w-[36px] h-[36px]" /> */}
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-wallet-gradient bg-clip-text text-transparent">
                MyWallet
              </h1>
              <p className="text-sm text-muted-foreground">
                {currentAccount.name}
              </p>
              {/* <p>
                {getMnemonic()}
              </p> */}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={lockWallet}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4" />
          </Button>
          {/* <Label
            onClick={exit}
            className="text-muted-foreground hover:text-foreground"
          >
            退出账户
          </Label> */}
        </div>

        {/* Navigation */}
        <div className="flex gap-1 justify-between rounded-md bg-[rgb(45,46,55)] overflow-x-hidden">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('overview')}
          >
            总览
          </Button>
          <Button
            variant={activeTab === 'accounts' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('accounts')}
          >
            账户
          </Button>
          <Button
            variant={activeTab === 'networks' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('networks')}
          >
            <Network className="w-4 h-4 mr-1" />
            网络
          </Button>
          <Button
            variant={activeTab === 'tokens' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('tokens')}
          >
            <Coins className="w-4 h-4 mr-1" />
            代币
          </Button>
          <Button
            variant={activeTab === 'send' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('send')}
          >
            <Send className="w-4 h-4 mr-1" />
            转账
          </Button>
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Account Info Card */}
            <Card className="bg-wallet-gradient">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[rgb(45,46,55)] text-sm">当前账户</div>
                  <Badge variant="secondary" className="bg-white/20 text-[rgba(45,46,55,0.5)] border-white/20">
                    {currentNetwork.name}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-2xl font-bold text-[rgb(45,46,55)]">
                    {currentAccount.name}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyAddress}
                    className="text-[rgb(45,46,55)] hover:text-[rgb(45,46,55)] hover:bg-[rgb(184,247,3)]"
                  >
                    {copiedAddress ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>

                <div className="text-[rgb(45,46,55)] text-sm font-mono">
                  {formatAddress(currentAccount.address)}
                </div>
              </CardContent>
            </Card>

            {/* Balance Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  钱包余额
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBalance(!showBalance)}
                  >
                    {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refreshBalances}
                    disabled={isLoading}
                  >
                    刷新
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold">
                    {showBalance ? `${parseFloat(ethBalance).toFixed(4)} ${currentNetwork.symbol}` : '••••••'}
                  </div>
                  {isLoading && (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tokens */}
            {tokens?.[currentAccount.address]?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">代币资产</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tokens?.[currentAccount.address]?.map((token) => (
                      <div key={token.address} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div className="flex items-center gap-3">
                          {token.image && (
                            <img 
                              src={token.image} 
                              alt={token.symbol}
                              className="w-8 h-8 rounded-full"
                            />
                          )}
                          <div>
                            <div className="font-medium">{token.symbol}</div>
                            <div className="text-sm text-muted-foreground">{token.name}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {showBalance ? (token.balance || '0') : '••••'}
                          </div>
                          <div className="text-sm text-muted-foreground">{token.type}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => setActiveTab('send')}
                className="bg-wallet-gradient hover:opacity-90"
              >
                <Send className="w-4 h-4 mr-2" />
                转账
              </Button>
              <Button 
                variant="outline"
                onClick={() => setActiveTab('tokens')}
              >
                <Plus className="w-4 h-4 mr-2" />
                添加代币
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'accounts' && <Accounts/>}
        {activeTab === 'networks' && <Networks/>}
        {activeTab === 'tokens' && <Tokens/>}
        {activeTab === 'send' && <Transactions/>}
      </div>
    </div>
  );
};
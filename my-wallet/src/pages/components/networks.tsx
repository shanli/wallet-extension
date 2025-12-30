import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import useWalletStore  from '@/stores';
import type { Network } from '@/types/wallet';
import { Check, Plus, Wifi } from 'lucide-react';
import { useState } from 'react';

export const Networks = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newNetwork, setNewNetwork] = useState<Partial<Network>>({
    name: '',
    rpcUrl: '',
    chainId: 0,
    symbol: '',
    blockExplorerUrl: ''
  });

  const { networks, currentNetwork, addNetwork, switchNetwork } = useWalletStore();
  const { toast } = useToast();

  const handleAddNetwork = () => {
    if (!newNetwork.name || !newNetwork.rpcUrl || !newNetwork.chainId || !newNetwork.symbol) {
      toast({
        title: "请填写必填字段",
        description: "网络名称、RPC URL、链ID和符号为必填项",
        variant: "destructive"
      });
      return;
    }

    const network: Network = {
      id: newNetwork.name!.toLowerCase().replace(/\s+/g, '-'),
      name: newNetwork.name!,
      rpcUrl: newNetwork.rpcUrl!,
      chainId: newNetwork.chainId!,
      symbol: newNetwork.symbol!,
      blockExplorerUrl: newNetwork.blockExplorerUrl || undefined
    };

    try {
      addNetwork(network);
      setIsAddDialogOpen(false);
      setNewNetwork({
        name: '',
        rpcUrl: '',
        chainId: 0,
        symbol: '',
        blockExplorerUrl: ''
      });
      toast({
        title: "网络添加成功！",
        description: `${network.name} 已添加到网络列表`
      });
    } catch (error) {
      toast({
        title: "添加失败",
        description: "无法添加网络",
        variant: "destructive"
      });
    }
  };

  const handleSwitchNetwork = (networkId: string) => {
    try {
      switchNetwork(networkId);
      toast({
        title: "网络切换成功",
        description: `已切换到 ${networks.find(n => n.id === networkId)?.name}`
      });
    } catch (error) {
      toast({
        title: "切换失败",
        description: "无法切换网络",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">网络管理</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              添加网络
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>添加自定义网络</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="networkName">网络名称 *</Label>
                <Input
                  id="networkName"
                  value={newNetwork.name}
                  onChange={(e) => setNewNetwork({ ...newNetwork, name: e.target.value })}
                  placeholder="如: Polygon Mainnet"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rpcUrl">RPC URL *</Label>
                <Input
                  id="rpcUrl"
                  value={newNetwork.rpcUrl}
                  onChange={(e) => setNewNetwork({ ...newNetwork, rpcUrl: e.target.value })}
                  placeholder="https://polygon-rpc.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="chainId">链ID *</Label>
                <Input
                  id="chainId"
                  type="number"
                  value={newNetwork.chainId || ''}
                  onChange={(e) => setNewNetwork({ ...newNetwork, chainId: parseInt(e.target.value) || 0 })}
                  placeholder="137"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="symbol">货币符号 *</Label>
                <Input
                  id="symbol"
                  value={newNetwork.symbol}
                  onChange={(e) => setNewNetwork({ ...newNetwork, symbol: e.target.value })}
                  placeholder="MATIC"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="explorerUrl">区块浏览器URL (可选)</Label>
                <Input
                  id="explorerUrl"
                  value={newNetwork.blockExplorerUrl}
                  onChange={(e) => setNewNetwork({ ...newNetwork, blockExplorerUrl: e.target.value })}
                  placeholder="https://polygonscan.com"
                />
              </div>
              
              <Button onClick={handleAddNetwork} className="w-full">
                添加网络
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {networks.map((network) => (
          <Card 
            key={network.id}
            className={`cursor-pointer transition-all ${
              currentNetwork.id === network.id 
                ? 'ring-2 ring-primary bg-card' 
                : 'hover:bg-muted/50'
            }`}
            onClick={() => handleSwitchNetwork(network.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    currentNetwork.id === network.id ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                  <div>
                    <div className="font-medium">{network.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Chain ID: {network.chainId} • {network.symbol}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {currentNetwork.id === network.id && (
                    <div className="flex items-center gap-1 text-green-500">
                      <Wifi className="w-4 h-4" />
                      <span className="text-xs">已连接</span>
                    </div>
                  )}
                  
                  {currentNetwork.id === network.id && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </div>
              </div>
              
              <div className="mt-2 text-xs text-muted-foreground font-mono">
                {network.rpcUrl}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-sm text-muted-foreground">
        <p>• 主网络用于真实交易</p>
        <p>• 测试网络用于开发和测试</p>
        <p>• 添加自定义网络时请确保RPC URL正确</p>
      </div>
    </div>
  );
};
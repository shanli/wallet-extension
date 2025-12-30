import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import  useWalletStore  from '@/stores';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Check, X, UserPlus, Key } from 'lucide-react';

export const Accounts = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [importAccountName, setImportAccountName] = useState('');
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [password, setPassword] = useState('');

  const { 
    accounts, 
    currentAccount, 
    createAccount, 
    switchAccount, 
    updateAccountName,
    importPrivateKey,
    isValidPassword
  } = useWalletStore();
  const { toast } = useToast();

  const handleCreateAccount = async () => {
    if (!password) {
      toast({
        title: "请输入密码",
        description: "需要密码验证以创建新账户",
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

    try {
      await createAccount(newAccountName || undefined);
        setIsCreateDialogOpen(false);
        setNewAccountName('');
        setPassword('');
        toast({
            title: "账户创建成功！"
        });
    } catch (error) {
      toast({
        title: "创建失败",
        description: "无法创建新账户",
        variant: "destructive"
      });
    }
  };

  const handleImportAccount = async () => {
    if (!password) {
      toast({
        title: "请输入密码",
        description: "需要密码验证以导入账户",
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

    if (!privateKey.trim()) {
      toast({
        title: "请输入私钥",
        variant: "destructive"
      });
      return;
    }

    try {
      await importPrivateKey(privateKey.trim(), password, importAccountName || undefined);
      setIsImportDialogOpen(false);
      setPrivateKey('');
      setImportAccountName('');
      setPassword('');
      toast({
        title: "账户导入成功！"
      });
    } catch (error) {
      toast({
        title: "导入失败",
        description: "私钥无效或其他错误",
        variant: "destructive"
      });
    }
  };

  const handleEditName = (address: string, currentName: string) => {
    setEditingAccount(address);
    setEditName(currentName);
  };

  const handleSaveEdit = (address: string) => {
    if (editName.trim()) {
      updateAccountName(address, editName.trim());
      toast({
        title: "账户名称已更新"
      });
    }
    setEditingAccount(null);
    setEditName('');
  };

  const handleCancelEdit = () => {
    setEditingAccount(null);
    setEditName('');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">账户管理</h2>
        <div className="flex gap-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                创建账户
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>创建新账户</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="accountName">账户名称 (可选)</Label>
                  <Input
                    id="accountName"
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                    placeholder="输入账户名称"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">确认密码</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="输入钱包密码"
                  />
                </div>
                <Button onClick={handleCreateAccount} className="w-full">
                  <UserPlus className="w-4 h-4 mr-2" />
                  创建账户
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Key className="w-4 h-4 mr-2" />
                导入私钥
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>导入私钥</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="privateKey">私钥</Label>
                  <Input
                    id="privateKey"
                    type="password"
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    placeholder="输入私钥"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="importAccountName">账户名称 (可选)</Label>
                  <Input
                    id="importAccountName"
                    value={importAccountName}
                    onChange={(e) => setImportAccountName(e.target.value)}
                    placeholder="输入账户名称"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="importPassword">确认密码</Label>
                  <Input
                    id="importPassword"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="输入钱包密码"
                  />
                </div>
                <Button onClick={handleImportAccount} className="w-full">
                  <Key className="w-4 h-4 mr-2" />
                  导入账户
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-3">
        {accounts.map((account) => (
          <Card 
            key={account.address}
            className={`cursor-pointer transition-all ${
              currentAccount?.address === account.address 
                ? 'ring-2 ring-primary bg-card' 
                : 'hover:bg-muted/50'
            }`}
            onClick={() => switchAccount(account.address)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {editingAccount === account.address ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="text-sm"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveEdit(account.address);
                        }}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelEdit();
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="font-medium">{account.name}</div>
                        <div className="text-sm text-muted-foreground font-mono">
                          {formatAddress(account.address)}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditName(account.address, account.name);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
                
                {currentAccount?.address === account.address && (
                  <div className="ml-4">
                    <span className="text-xs bg-[rgb(184,247,3)] text-[rgb(45,46,55)] px-2 py-1 rounded">
                      当前账户
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
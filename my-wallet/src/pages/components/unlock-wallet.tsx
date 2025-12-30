import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useWalletStore  from '@/stores';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Wallet, Lock } from 'lucide-react';

export const Unlock = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { unlockWallet } = useWalletStore();
  const { toast } = useToast();

  const handleUnlock = async () => {
    if (!password) {
      toast({
        title: "请输入密码",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const success = unlockWallet(password);
      if (!success) {
        toast({
          title: "密码错误",
          description: "请检查您的密码",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "解锁失败",
        description: "发生未知错误",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUnlock();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-wallet-gradient rounded-full flex items-center justify-center mx-auto mb-4 shadow-wallet-glow">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-wallet-gradient bg-clip-text text-transparent">
            欢迎回来
          </h1>
          <p className="text-muted-foreground mt-2">
            请输入密码解锁您的钱包
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              解锁钱包
            </CardTitle>
            <CardDescription>
              输入您的钱包密码以继续
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="输入您的钱包密码"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <Button 
              onClick={handleUnlock} 
              className="w-full bg-wallet-gradient hover:opacity-90"
              disabled={isLoading || !password}
            >
              {isLoading ? "解锁中..." : "解锁钱包"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
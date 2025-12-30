import React, {useState} from "react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Check, Copy, Eye, EyeOff, Import, Key, Wallet } from 'lucide-react';
import useWalletStore from "@/stores";
import { useToast } from "@/hooks/use-toast";

function CreateWallet() {
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [mnemonic, setMnemonic] = useState('');
    const [privateKey, setPrivateKey] = useState('');
    const [showPassword, setShowPassword] = useState<boolean>(false)
    const [showMnemonic, setShowMnemonic] = useState(false);
    const [copiedMnemonic, setCopiedMnemonic] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const {createWallet, importWallet, importPrivateKey} = useWalletStore()
    const { toast } = useToast();
    const handleCreateWallet = async () => {
        if (password !== confirmPassword) {
            toast({
                title: "密码不匹配",
                description: "请确保两次输入的密码相同",
                variant: "destructive"
            });
            return;
        }

        if (password.length < 8) {
            toast({
                title: "密码太短",
                description: "密码长度至少需要8位",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);
        try {
        const { mnemonic: newMnemonic } = await createWallet(password);
        setMnemonic(newMnemonic);
        toast({
            title: "钱包创建成功！",
            description: "请务必备份您的助记词"
        });
        } catch (error) {
            console.log(error);
            toast({
                title: "创建失败",
                description: "钱包创建过程中出现错误",
                variant: "destructive"
            });
            } finally {
            setIsLoading(false);
        }
    };

    const handleImportWallet = async () => {
        if (!mnemonic.trim()) {
            toast({
                title: "请输入助记词",
                variant: "destructive"
            });
            return;
        }

        if (password.length < 8) {
            toast({
                title: "密码太短",
                description: "密码长度至少需要8位",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);
        try {
            await importWallet(mnemonic.trim(), password);
            toast({
                title: "钱包导入成功！"
            });
        } catch (error) {
            toast({
                title: "导入失败",
                description: "助记词无效或其他错误",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }

    const handleImportPrivateKey = async () => {
        if (!privateKey.trim()) {
            toast({
                title: "请输入私钥",
                variant: "destructive"
            });
            return;
        }

        if (password.length < 8) {
            toast({
                title: "密码太短",
                description: "密码长度至少需要8位",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);
        try {
            await importPrivateKey(privateKey.trim(), password);
            toast({
                title: "私钥导入成功！"
            });
        } catch (error) {
            toast({
                title: "导入失败",
                description: "私钥无效或其他错误",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

// importPrivateKey
    const copyMnemonic = async () => {
        if (mnemonic) {
        await navigator.clipboard.writeText(mnemonic);
        setCopiedMnemonic(true);
        setTimeout(() => setCopiedMnemonic(false), 2000);
        toast({
            title: "助记词已复制",
            description: "请安全保存"
        });
        }
    };
    return (
    <>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-fade-in">
                {/* <div className="text-center mb-8"> */}
                
                <h1 className="text-3xl font-bold bg-[rgb(184,247,3)] bg-clip-text text-transparent">
                    MyWallet1
                </h1>
                {/* </div> */}
                <Tabs defaultValue="create" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="create">创建钱包</TabsTrigger>
                        <TabsTrigger value="import">导入助记词</TabsTrigger>
                        <TabsTrigger value="privatekey">导入私钥</TabsTrigger>
                    </TabsList>

                    <TabsContent value="create">
                        <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                            <Wallet className="w-5 h-5" />
                            创建新钱包
                            </CardTitle>
                            <CardDescription>
                            创建一个新的以太坊钱包并生成助记词
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                            <Label htmlFor="password">设置密码</Label>
                            <div className="relative">
                                <Input
                                id="password"
                                  type={showPassword ? "text" : "password"}
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                placeholder="输入密码 (至少8位)"
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

                            <div className="space-y-2">
                            <Label htmlFor="confirmPassword">确认密码</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="再次输入密码"
                            />
                            </div>

                            {mnemonic && (
                                <div className="space-y-2">
                                    <Label>助记词 (请安全保存)</Label>
                                    <div className="relative">
                                    <Textarea
                                        value={showMnemonic ? mnemonic : mnemonic.split(' ').map(() => '●●●●').join(' ')}
                                        readOnly
                                        className="min-h-[100px] font-mono text-sm"
                                    />
                                    <div className="absolute top-2 right-2 flex gap-1">
                                        <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowMnemonic(!showMnemonic)}
                                        >
                                        {showMnemonic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </Button>
                                        <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={copyMnemonic}
                                        >
                                        {copiedMnemonic ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                    </div>
                                </div>
                            )}

                            <Button 
                              onClick={handleCreateWallet} 
                            className="w-full bg-[rgb(44,46,55)] hover:opacity-90"
                            //   disabled={isLoading || !password || !confirmPassword}
                            >
                            {isLoading ? "创建中..." : "创建钱包"}
                            </Button>
                        </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="import">
                        <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                            <Import className="w-5 h-5" />
                            导入钱包
                            </CardTitle>
                            <CardDescription>
                            使用现有的助记词导入钱包
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                            <Label htmlFor="mnemonic">助记词</Label>
                            <Textarea
                                id="mnemonic"
                                value={mnemonic}
                                onChange={(e) => setMnemonic(e.target.value)}
                                placeholder="输入12或24个助记词，用空格分隔"
                                className="min-h-[100px]"
                            />
                            </div>

                            <div className="space-y-2">
                            <Label htmlFor="importPassword">设置密码</Label>
                            <Input
                                id="importPassword"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="输入密码 (至少8位)"
                            />
                            </div>

                            <Button 
                              onClick={handleImportWallet} 
                            className="w-full bg-wallet-gradient hover:opacity-90"
                            //   disabled={isLoading || !mnemonic || !password}
                            >
                            {isLoading ? "导入中..." : "导入钱包"}
                            </Button>
                        </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="privatekey">
                        <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                            <Key className="w-5 h-5" />
                            导入私钥
                            </CardTitle>
                            <CardDescription>
                            使用私钥导入账户
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                            <Label htmlFor="privateKey">私钥</Label>
                            <Input
                                id="privateKey"
                                type="password"
                                value={privateKey}
                                onChange={(e) => setPrivateKey(e.target.value)}
                                placeholder="输入私钥 (0x开头的64位十六进制字符)"
                            />
                            </div>

                            <div className="space-y-2">
                            <Label htmlFor="keyPassword">设置密码</Label>
                            <Input
                                id="keyPassword"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="输入密码 (至少8位)"
                            />
                            </div>

                            <Button 
                              onClick={handleImportPrivateKey} 
                            className="w-full bg-wallet-gradient hover:opacity-90"
                            //   disabled={isLoading || !privateKey || !password}
                            >
                            {isLoading ? "导入中..." : "导入私钥"}
                            </Button>
                        </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    </>
  )
}

export default CreateWallet
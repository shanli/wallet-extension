import React, {useState} from "react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Check, Copy, Eye, EyeOff, Import, Key, Wallet } from 'lucide-react';
import CreateWallet from "./components/create-wallet";
import { Unlock } from "./components/unlock-wallet";
import { Dashboard } from "./components/dashboard";
import useWalletStore from '@/stores'

function IndexPopup() {
    const {accounts, isLocked } = useWalletStore();
    console.log('accounts=======>', accounts);
    //  console.log('storage======>', chrome.storage);
    // console.log('storage local======>', chrome.storage.local);
    if (accounts.length === 0) {
        return <CreateWallet/>;
    }
    if (isLocked) {
        return <Unlock />;
    }
            
    return <Dashboard />;
            
}

export default IndexPopup
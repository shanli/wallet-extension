import { create } from 'zustand';
import { persist } from 'zustand/middleware'
import { 
    type Network, 
    type Token, 
    type WalletAccount, 
    type WalletState, 
    DEFAULT_NETWORKS 
} from '@/types/wallet';
// import {  } from 'viem'
import { createPublicClient, createWalletClient, http,custom, type PublicClient, type WalletClient } from 'viem';
import { mainnet, sepolia } from 'viem/chains'
import { 
    english, 
    generateMnemonic, 
    mnemonicToAccount, 
    HDKey, 
    hdKeyToAccount, 
    privateKeyToAccount
} from 'viem/accounts'
import * as bip39 from 'bip39';
import { AES, SHA256, enc } from 'crypto-js';
import { Storage } from "@plasmohq/storage"
import { constants } from 'buffer';



interface WalletStore extends WalletState {
    getMnemonic: () => string;
    clearAccount: () => void;
    createWallet: (password: string) => Promise<{ mnemonic: string; account: WalletAccount }>;
    importWallet: (mnemonic: string, password: string) => Promise<WalletAccount>;
    importPrivateKey: (privateKey: string, password: string, name?: string) => Promise<WalletAccount>;
    
    lockWallet: () => void
    unlockWallet: (password: string) => boolean

    addNetwork: (network: Network) => void;
    switchNetwork: (networkId: string) => void;
    
    createAccount: (name?: string) => WalletAccount;
    switchAccount: (address: string) => void;
    updateAccountName: (address: string, name: string) => void;

    getClient: () => PublicClient<any>;
    getwalletClient: () => WalletClient<any>;
    isValidPassword: (password: string) => boolean;

    addToken: (token: Token) => void
    removeToken: (address: string) => void
    updateTokenBalance: (address: string, balance: string) => void;


    connect: () => Promise<WalletAccount>;
    signMessage: (message: string) => Promise<string>;
    disconnect: () => void;
}

const initialState: WalletState = {
  isLocked: false,
  isConnected: false,
  accounts: [],
  currentAccount: null,
  mnemonic: null,
  password: null,
  currentNetwork: DEFAULT_NETWORKS[0],
  networks: DEFAULT_NETWORKS,
  tokens: {}
};
type WalletCreator = (set: any, get: any, api: any) => WalletStore;
const storage = new Storage({
  area: "local"
})
const useWalletStore = create<WalletStore>(
    persist((set, get) => ({
        ...initialState,
        getMnemonic: () => {
            const store = get();
            const mnemonic = AES.decrypt(store.mnemonic, '12345678').toString(enc.Utf8);
            return mnemonic;
        },
        clearAccount: () => {
            set({accounts: []})
        },
        createWallet: async (password: string) => {
            // 生成助记词
            const mnemonic = generateMnemonic(english);
            // console.log('mnemonic==============>', account)
            // 方法一：mnemonicToAccount内部直接封装了种子生成和密钥派生
            const wallet = mnemonicToAccount(mnemonic, {
                // 可以在这里指定路径，比如 accountIndex 派生
                accountIndex: 0, // 派生第一个账户
            })
            console.log('方法一account==============>', wallet);
            const privateKey = wallet.getHdKey().privateKey;
            console.log('privateKey==============>', privateKey.toString());

            const account: WalletAccount = {
                address: wallet.address,
                privateKey: privateKey.toString(),
                name: 'Account 1',
                index: 0
            };
            /*
                // 方法二：调用bip39提供的方法生成seedBuffer转换成seed
                // 生成种子
                const seedBuffer = await bip39.mnemonicToSeed(mnemonic);
                // 转成 Uint8Array
                const seed = new Uint8Array(seedBuffer);
                // 要初始化一个 HD 账户，你需要将一个 HDKey 实例 传递给 hdKeyToAccount
                const hdKey = HDKey.fromMasterSeed(seed) 
                const account2 = hdKeyToAccount(hdKey) 
                console.log('方法二：account=============>',account2);
                // const account: WalletAccount = {
                //     address: wallet.address,
                //     privateKey: wallet.privateKey,
                //     name: 'Account 1',
                //     index: 0
                // };
            */
            
            // // Encrypt sensitive data
            const encryptedMnemonic = AES.encrypt(mnemonic, password).toString();
            const encryptedPrivateKey = AES.encrypt(privateKey.toString(), password).toString();
            
            set({
                isLocked: false,
                accounts: [{ ...account, privateKey: encryptedPrivateKey }],
                currentAccount: account,
                mnemonic: encryptedMnemonic,
                password: SHA256(password).toString()
            });
            // console.log('initialState===>', initialState);
            const storeData = get()
            console.log('storeData===>', storeData);
            return { mnemonic, account };
        },
        // 测试：vacuum desert hollow second expire soda attract edge fuel spice violin first
        importWallet: async (mnemonic: string, password: string) => {
            if (!bip39.validateMnemonic(mnemonic)) {
                throw new Error('Invalid mnemonic phrase');
            }

            const seedBuffer = await bip39.mnemonicToSeed(mnemonic);
            const seed = new Uint8Array(seedBuffer);
            const hdKey = HDKey.fromMasterSeed(seed) 
            const wallet = hdKeyToAccount(hdKey, {
                path: "m/44'/60'/0'/0/0"
            });
            const privateKey = wallet.getHdKey().privateKey.toString();
            const account: WalletAccount = {
                address: wallet.address,
                privateKey,
                name: 'Account import 1',
                index: 0
            };

            const encryptedMnemonic = AES.encrypt(mnemonic, password).toString();
            const encryptedPrivateKey = AES.encrypt(privateKey, password).toString();

            set({
                isLocked: false,
                accounts: [{ ...account, privateKey: encryptedPrivateKey }],
                currentAccount: account,
                mnemonic: encryptedMnemonic,
                password: SHA256(password).toString()
            });
            return account;
         },
        //  测试：0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
        // 3db9c7462d99f60a7f5de13c72b7f58cd4604d900e5f85084a66670af0195802
        importPrivateKey: async (privateKey: string, password: string, name = 'Imported Account') => {
            // @ts-ignore
            const wallet = privateKeyToAccount(privateKey)
            console.log('==================>', wallet)
            const existingAccounts = get().accounts;
            const account: WalletAccount = {
                address: wallet.address,
                privateKey,
                name,
                index: existingAccounts.length
            };
            const encryptedPrivateKey = AES.encrypt(privateKey, password).toString();
            set(state => ({
                accounts: [...state.accounts, { ...account, privateKey: encryptedPrivateKey }],
                currentAccount: account,
                password: SHA256(password).toString()
            }));
            return account;
            
        },
        unlockWallet: (password: string) => {
            const state = get();
            const hashedPassword = SHA256(password).toString();
            
            if (state.password === hashedPassword) {
                set({ isLocked: false });
                return true;
            }
            return false;
        },

        lockWallet: () => {
            set({ isLocked: true });
        },
        // 0xd9145CCE52D386f254917e481eB44e9943F39138/0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8/
        // 0xD7ACd2a9FD159E69Bb102A1ca21C9a3e3A5F771B/0xf8e81D47203A594245E36C48e151709F0C19fBe8
        // 0x7EF2e0048f5bAeDe046f6BF797943daF4ED8CB47/
        // 0xDA0bab807633f07f013f94DD0E6A4F96F8742B53
        addToken: (token: Token) => {
            const state = get();
            const tokens = state.tokens;
            const prev = tokens[state.currentAccount.address] || [];
            // @ts-ignore
            set(state => ({
                tokens: {
                    ...state.tokens,
                    // @ts-ignore
                    [`${state.currentAccount.address}`]: [...prev?.filter(t => t.address !== token.address), token]
                    // legal winner thank year wave sausage worth useful legal winner thank yellow
                }
            }));
        },

        removeToken: (address: string) => {
            set(state => ({
                [`${state.currentAccount.address}`]: state.tokens.filter(token => token.address !== address)
                // tokens: state.tokens.filter(token => token.address !== address)
            }));
        },

        updateTokenBalance: (address: string, balance: string) => {
            set(state => ({
                tokens: state.tokens?.[state.currentAccount.address]?.map(token =>
                    token[state.currentAccount.address].address === address ? { ...token[state.currentAccount.address], balance } : token
                )
            }));
        },
        addNetwork: (network: Network) => {
            set(state => ({
            networks: [...state.networks, network]
            }));
        },

        switchNetwork: (networkId: string) => {
            const state = get();
            const network = state.networks.find(net => net.id === networkId);
            if (network) {
            set({ currentNetwork: network });
            }
        },
        // 0xAfC782B606de889Bb71F2B2113dfAf2f6Fb7985b
        createAccount: (name?: string) => {
            const state = get();
            console.log('================>', state)
            if (!state.mnemonic || !state.password) {
                throw new Error('No wallet found');
            }
            const seedBuffer = bip39.mnemonicToSeedSync(state.mnemonic);
            const seed = new Uint8Array(seedBuffer);
            // Decrypt mnemonic to create new account
            // const decryptedMnemonic = AES.decrypt(state.mnemonic, state.password);
            // console.log('================>', decryptedMnemonic.toString());
            // const seedBuffer = bip39.mnemonicToSeedSync(decryptedMnemonic);
            // console.log('================>', seedBuffer);
            // const seed = new Uint8Array(seedBuffer);
            const hdKey = HDKey.fromMasterSeed(seed) 
            const accountIndex = state.accounts.length;
            const wallet = hdKeyToAccount(hdKey, {
                path: `m/44'/60'/0'/0/${accountIndex}`
            }) 
            // const hdNode = ethers.HDNodeWallet.fromSeed(seed);
            // const accountIndex = state.accounts.length;
            // const wallet = hdNode.derivePath(`m/44'/60'/0'/0/${accountIndex}`);
            const privateKey = wallet.getHdKey().privateKey.toString();
            const account: WalletAccount = {
                address: wallet.address,
                privateKey,
                name: name || `Account ${accountIndex + 1}`,
                index: accountIndex
            };

            const encryptedPrivateKey = AES.encrypt(privateKey, state.password).toString();

            set(state => ({
                accounts: [...state.accounts, { ...account, privateKey: encryptedPrivateKey }],
                currentAccount: account
            }));

            return account;
        },

        switchAccount: (address: string) => {
            const state = get();
            const account = state.accounts.find(acc => acc.address === address);
            if (account) {
            set({ currentAccount: account });
            }
        },

        updateAccountName: (address: string, name: string) => {
            set(state => ({
            accounts: state.accounts.map(acc => 
                acc.address === address ? { ...acc, name } : acc
            ),
            currentAccount: state.currentAccount?.address === address 
                ? { ...state.currentAccount, name }
                : state.currentAccount
            }));
        },
        getClient: () => {
            const publicClient = createPublicClient({ 
                chain: sepolia,
                transport: http()
            })
            return publicClient;
        },
        getwalletClient: () => {
            // account5 to:0xAfC782B606de889Bb71F2B2113dfAf2f6Fb7985b
            let walletClient;
            // if (typeof window !== 'undefined' && window.ethereum) {
                walletClient = createWalletClient({
                    chain: sepolia,
                    transport: http()
                    // @ts-ignore
                    // transport: custom(window.ethereum!)
                })
            // }
            return walletClient;
        },
        isValidPassword: (password: string) => {
            const state = get();
            const hashedPassword = SHA256(password).toString();
            return state.password === hashedPassword;
        },
        connect: async (): Promise<WalletAccount> => {
            const state = await new Promise<WalletState | null>((resolve) => {
            chrome.storage.local.get('wallet-store', (result) => {
                console.log('钱包信息:', result['wallet-store']);
                resolve(result['wallet-store']?.state || null);
            });
            });

            if (!state || !state.currentAccount) {

                throw new Error('请先在插件中导入账户');
            }
            console.log(state);
            console.log(state.currentAccount );
            
            const account = state.currentAccount as WalletAccount;
            set({
            currentAccount: account,
            isConnected: true
            });

            return account;
        },
        signMessage: async (message) => {
            const { state } = JSON.parse(localStorage.getItem("wallet-store"))
            console.log('钱包信息:', state);
            const account = state.currentAccount
            if (!account) {
            throw new Error('未连接钱包')
            }
            const bytes = AES.decrypt(account.privateKey, state.password);
            const privateKey = bytes.toString(enc.Utf8)
            // @ts-ignore
            const wallet = privateKeyToAccount(privateKey)
            // const wallet = new ethers.Wallet(privateKey)
            return wallet.signMessage({message})
        },
        disconnect: () => {
            set({ currentAccount: null, isConnected: false})
        }
}),{
      name: 'wallet-store',
      // 自定义存储：使用 chrome.storage.local
      storage: {
        getItem: async (name: string) => {
            // const result = await chrome.storage.local.get(name);
            const result = await storage.get(name);
            // return result[name] || null;
            return result || null;
          },
          setItem: async (name: string, value: any) => {
            console.log('=====>', name, value)
            // await chrome.storage.local.set({ [name]: value });
            await storage.set(name, value);
          },
          removeItem: async (name: string) => {
            // await chrome.storage.local.remove(name);
            await storage.removeItem(name);
          }
      },
      partialize: (state) => ({
        accounts: state.accounts,
        mnemonic: state.mnemonic,
        password: state.password,
        networks: state.networks,
        tokens: state.tokens,
        currentNetwork: state.currentNetwork,
        currentAccount: state.currentAccount,
        isConnected: state.isConnected
      })
    }
) as WalletCreator
)
export default useWalletStore;
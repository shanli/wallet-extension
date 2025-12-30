declare module 'bip39' {
  export function generateMnemonic(): string;
  export function validateMnemonic(mnemonic: string): boolean;
  export function mnemonicToSeed(mnemonic: string): Promise<Buffer>;
  export function mnemonicToSeedSync(mnemonic: string): Buffer;
}
declare module 'crypto-js' {
  export const AES: {
    encrypt: (message: string, key: string) => { toString: () => string };
    decrypt: (ciphertext: string, key: string) => { toString: (encoding: any) => string };
  };
  export const SHA256: (message: string) => { toString: () => string };
  export const enc: {
    Utf8: any;
  };
}
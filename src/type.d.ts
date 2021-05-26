declare module 'near-seed-phrase' {
    const KEY_DERIVATION_PATH: string

    interface Mnemonic {
        seedPhrase: string
        secretKey: string
        publicKey: string
    }

    function generateSeedPhrase(entropy?: Buffer): Mnemonic;

    function parseSeedPhrase(seedPhrase: string, derivationPath?: string): Mnemonic;

    function normalizeSeedPhrase(seedPhrase: string): string;
}


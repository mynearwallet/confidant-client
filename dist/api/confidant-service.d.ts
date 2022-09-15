export declare type HandshakeResponse = {
    combinedKey: string;
};
export declare type AuthData = {
    goog: string;
};
export declare type AuthStatus = {
    goog: boolean;
};
export declare type GetCombinedKeyResponse = {
    combinedKey: string;
};
export declare type SignTransactionResponse = {
    data: string | null;
    success: boolean;
    reason?: string;
};
export default class ConfidantService {
    private request;
    constructor(address: string);
    handshake: (publicKey: string, pkhash: string) => Promise<HandshakeResponse>;
    getCombinedKey: (publicKey: string) => Promise<GetCombinedKeyResponse>;
    signTransaction: (message: string, data: string, clientPublicKey: string, auth?: AuthData | undefined) => Promise<SignTransactionResponse>;
    qrCode: (url: string) => Promise<Blob>;
    hasAuth: (publicKey: string) => Promise<AuthStatus>;
    createGoogTwoFA: (accountId: string, publicKey: string) => Promise<Blob>;
    activateGoogTwoFA: (publicKey: string, token: string) => Promise<{
        success: boolean;
        reason?: string;
    }>;
    deactivateGoogTwoFA: (pkhash: string) => Promise<{
        success: boolean;
    }>;
}

import { ConnectConfig } from 'near-api-js';
import { KeyPairEd25519 } from 'near-api-js/lib/utils/key_pair';
import { Action } from 'near-api-js/lib/transaction';
import { AuthData as AuthApiData } from './api/confidant-service';
export declare type AuthData = AuthApiData;
export default class Confidant {
    private networkConfig;
    private confidantService;
    private keyPrefix?;
    constructor(address: string, networkConfig: ConnectConfig, keyPrefix?: string);
    static keyPairBySeedPhrase(phrase: string): KeyPairEd25519;
    getKeyPair(accountId: string): Promise<KeyPairEd25519 | null>;
    handshake(accountId: string, secret: string): Promise<void>;
    signAndSendTransaction: (accountId: string, reciever: string, action: Action | Action[], auth?: AuthApiData | undefined) => Promise<void>;
    private saveKeyPairLocally;
    private addPublicKey;
    private getCombinedKey;
    private getAccessKey;
    private multisigSign;
    private sendSignedTransaction;
    private getKeyStore;
}

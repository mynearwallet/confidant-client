import * as NearApiJs from 'near-api-js';
import { AuthData as AuthApiData } from './api/confidant-service';
export declare type AuthData = AuthApiData;
export default class Confidant {
    private networkConfig;
    private confidantService;
    private keyPrefix?;
    constructor(address: string, networkConfig: NearApiJs.ConnectConfig, keyPrefix?: string);
    static keyPairBySeedPhrase(phrase: string): NearApiJs.utils.KeyPairEd25519;
    getKeyPair: (accountId: string) => Promise<NearApiJs.utils.KeyPairEd25519 | null>;
    handshake: (accountId: string, secret: string) => Promise<void>;
    signAndSendTransaction: (accountId: string, reciever: string, action: NearApiJs.transactions.Action | NearApiJs.transactions.Action[], auth?: AuthData) => Promise<void>;
    private saveKeyPairLocally;
    private addPublicKey;
    private getCombinedKey;
    private getAccessKey;
    private multisigSign;
    private sendSignedTransaction;
    private getKeyStore;
}

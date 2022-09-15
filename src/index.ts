import * as NearApiJs from 'near-api-js';
import { AccessKeyView,  QueryResponseKind } from 'near-api-js/lib/providers/provider';
import sha256 from 'js-sha256';
import { parseSeedPhrase } from 'near-seed-phrase';
import * as Multisig from 'multisign/client';
import nacl from 'tweetnacl';
import ConfidantService, { AuthData as AuthApiData } from './api/confidant-service';
import createKeyPairEd25519 from './lib/crypto';

export type AuthData = AuthApiData;

export default class Confidant {
    private networkConfig: NearApiJs.ConnectConfig;
    private confidantService: ConfidantService;
    private keyPrefix?: string;

    constructor(
        address: string,
        networkConfig: NearApiJs.ConnectConfig,
        keyPrefix?: string,
    ) {
        this.networkConfig = networkConfig;
        this.confidantService = new ConfidantService(address);
        this.keyPrefix = keyPrefix;
    }

    public static keyPairBySeedPhrase(phrase: string): NearApiJs.utils.KeyPairEd25519 {
        return createKeyPairEd25519.fromString(parseSeedPhrase(phrase).secretKey);
    }

    public async getKeyPair(
        accountId: string
    ): Promise<NearApiJs.utils.KeyPairEd25519|null> {
        const key = await this.getKeyStore().getKey(
            this.networkConfig.networkId,
            accountId
        );

        /* eslint-disable max-len */
        /**
         * No generic type
         * @link {https://github.com/near/near-api-js/blob/master/src/key_stores/browser_local_storage_key_store.ts#L60}
         */
        /* eslint-enable max-len */
        return key as NearApiJs.utils.KeyPairEd25519;
    }

    public async handshake(
        accountId: string,
        secret: string,
    ): Promise<void> {
        const newKeyPair = NearApiJs.utils.KeyPairEd25519.fromRandom();
        await this.saveKeyPairLocally(accountId, newKeyPair);
        const handshakeResponse = await this.confidantService.handshake(
            newKeyPair.getPublicKey().toString(),
            sha256.sha256.hex(secret), // todo remove with 2fa refactor
        );

        const combinedKey = NearApiJs.utils.PublicKey
            .fromString(handshakeResponse.combinedKey);
        const secretKeyPair = createKeyPairEd25519.fromString(secret);
        await this.addPublicKey(accountId, secretKeyPair, combinedKey);
    }

    public signAndSendTransaction = async (
        accountId: string,
        reciever: string,
        action: NearApiJs.transactions.Action|NearApiJs.transactions.Action[],
        auth?: AuthData,
    ) => {
        const combinedPublicKey = await this.getCombinedKey(accountId);
        const accessKey = await this.getAccessKey(accountId, combinedPublicKey);

        const transaction = NearApiJs.transactions.createTransaction(
            accountId,
            combinedPublicKey,
            reciever,
            accessKey.nonce + 1,
            Array.isArray(action) ? action : [action],
            NearApiJs.utils.serialize.base_decode(accessKey.block_hash)
        );

        const keyPair = await this.getKeyPair(accountId);
        if (!keyPair) {
            console.error('Cannot create keypair with nullable accountId');

            return;
        }

        const signedTransaction = await this.multisigSign(
            transaction,
            keyPair,
            combinedPublicKey,
            auth
        );

        if (!signedTransaction) {
            console.error('Cannot sign transaction');

            return;
        }

        try {
            const result = await this.sendSignedTransaction(signedTransaction);
            console.log(result);
        } catch (e) {
            console.error(e);
        }
    };

    private async saveKeyPairLocally(
        accountId: string,
        keyPair: NearApiJs.utils.KeyPairEd25519
    ): Promise<void> {
        await this.getKeyStore().setKey(this.networkConfig.networkId, accountId, keyPair);
    }

    private async addPublicKey(
        accountId: string,
        accessKeyPair: NearApiJs.utils.KeyPairEd25519,
        publicKey: NearApiJs.utils.PublicKey
    ): Promise<void> {
        const memoryKeyStore = new NearApiJs.keyStores.InMemoryKeyStore();
        memoryKeyStore.setKey(
            this.networkConfig.networkId,
            accountId,
            accessKeyPair || NearApiJs.KeyPair.fromRandom('ed25519')
        );

        const connection = await NearApiJs.connect({
            ...this.networkConfig,
            keyStore: memoryKeyStore,
        });

        const account = await connection.account(accountId);
        await account.addKey(publicKey);
    }

    private async getCombinedKey(accountId: string): Promise<NearApiJs.utils.PublicKey> {
        const keyPair = await this.getKeyPair(accountId);

        if (!keyPair) {
            throw Error('Cannot create keypair with nullable accountId');
        }

        const response = await this.confidantService.getCombinedKey(
            keyPair.getPublicKey().toString()
        );

        return NearApiJs.utils.PublicKey.fromString(response.combinedKey);
    }

    private async getAccessKey<T extends QueryResponseKind & AccessKeyView>(
        accountId: string,
        publicKey: NearApiJs.utils.PublicKey
    ): Promise<T> {
        const provider = new NearApiJs.providers.JsonRpcProvider(
            this.networkConfig.nodeUrl
        );

        return await provider.query<T>(
            `access_key/${accountId}/${publicKey.toString()}`,
            ''
        );
    }

    private async multisigSign(
        transaction: NearApiJs.transactions.Transaction,
        privateKey: NearApiJs.utils.KeyPairEd25519,
        combinedPublicKey: NearApiJs.utils.PublicKey,
        auth?: AuthData,
    ): Promise<NearApiJs.transactions.SignedTransaction|null> {
        const step1 = Multisig.multiSignStep1();
        const encodedTransaction = transaction.encode();

        const serializedTxHash = new Uint8Array(
            sha256.sha256.array(encodedTransaction)
        );

        const step2Data = await this.confidantService.signTransaction(
            NearApiJs.utils.serialize.base_encode(serializedTxHash),
            NearApiJs.utils.serialize.base_encode(step1.data),
            privateKey.getPublicKey().toString(),
            auth
        );

        if (!step2Data.success) {
            console.error(step2Data.reason);

            return null;
        }

        if (!step2Data.data) {
            console.error('Multisig failed');

            return null;
        }

        const signature = Multisig.multiSignStep3(
            NearApiJs.utils.serialize.base_decode(step2Data.data),
            step1.secret,
            serializedTxHash,
            combinedPublicKey.data,
            NearApiJs.utils.serialize.base_decode(privateKey.secretKey)
        );

        if (signature === null) {
            return null;
        }

        const nacltest = nacl.sign.detached.verify(
            serializedTxHash,
            signature,
            combinedPublicKey.data,
        );

        console.log('NaclTest', nacltest);

        const signedTransaction = new NearApiJs.transactions.SignedTransaction({
            transaction,
            signature: new NearApiJs.transactions.Signature({
                keyType: transaction.publicKey.keyType,
                data: signature,
            }),
        });

        return signedTransaction;
    }

    private sendSignedTransaction<T>(
        transaction: NearApiJs.transactions.SignedTransaction
    ): Promise<T> {
        const signedSerializedTransaction = transaction.encode();
        // sends transaction to NEAR blockchain via JSON RPC call and records the result
        const provider = new NearApiJs.providers.JsonRpcProvider(
            this.networkConfig.nodeUrl
        );

        return provider.sendJsonRpc<T>('broadcast_tx_commit', [
            Buffer.from(signedSerializedTransaction).toString('base64'),
        ]);
    }

    private getKeyStore(): NearApiJs.keyStores.BrowserLocalStorageKeyStore {
        const keyStore = new NearApiJs.keyStores.BrowserLocalStorageKeyStore(
            window.localStorage,
            this.keyPrefix
        );

        return keyStore;
    }
}

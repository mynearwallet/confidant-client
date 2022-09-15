"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const NearApiJs = __importStar(require("near-api-js"));
const key_stores_1 = require("near-api-js/lib/key_stores");
const js_sha256_1 = __importDefault(require("js-sha256"));
const near_seed_phrase_1 = require("near-seed-phrase");
const Multisig = __importStar(require("multisign/dist/client"));
const tweetnacl_1 = __importDefault(require("tweetnacl"));
const confidant_service_1 = __importDefault(require("./api/confidant-service"));
const crypto_1 = __importDefault(require("./lib/crypto"));
class Confidant {
    constructor(address, networkConfig, keyPrefix) {
        this.signAndSendTransaction = (accountId, reciever, action, auth) => __awaiter(this, void 0, void 0, function* () {
            const combinedPublicKey = yield this.getCombinedKey(accountId);
            const accessKey = yield this.getAccessKey(accountId, combinedPublicKey);
            const transaction = NearApiJs.transactions.createTransaction(accountId, combinedPublicKey, reciever, accessKey.nonce + 1, Array.isArray(action) ? action : [action], NearApiJs.utils.serialize.base_decode(accessKey.block_hash));
            const keyPair = yield this.getKeyPair(accountId);
            if (!keyPair) {
                console.error('Cannot create keypair with nullable accountId');
                return;
            }
            const signedTransaction = yield this.multisigSign(transaction, keyPair, combinedPublicKey, auth);
            if (!signedTransaction) {
                console.error('Cannot sign transaction');
                return;
            }
            try {
                const result = yield this.sendSignedTransaction(signedTransaction);
                console.log(result);
            }
            catch (e) {
                console.error(e);
            }
        });
        this.networkConfig = networkConfig;
        this.confidantService = new confidant_service_1.default(address);
        this.keyPrefix = keyPrefix;
    }
    static keyPairBySeedPhrase(phrase) {
        return crypto_1.default.fromString((0, near_seed_phrase_1.parseSeedPhrase)(phrase).secretKey);
    }
    getKeyPair(accountId) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = yield this.getKeyStore().getKey(this.networkConfig.networkId, accountId);
            /* eslint-disable max-len */
            /**
             * No generic type
             * @link {https://github.com/near/near-api-js/blob/master/src/key_stores/browser_local_storage_key_store.ts#L60}
             */
            /* eslint-enable max-len */
            return key;
        });
    }
    handshake(accountId, secret) {
        return __awaiter(this, void 0, void 0, function* () {
            const newKeyPair = NearApiJs.utils.KeyPairEd25519.fromRandom();
            yield this.saveKeyPairLocally(accountId, newKeyPair);
            const handshakeResponse = yield this.confidantService.handshake(newKeyPair.getPublicKey().toString(), js_sha256_1.default.sha256.hex(secret));
            const combinedKey = NearApiJs.utils.PublicKey
                .fromString(handshakeResponse.combinedKey);
            const secretKeyPair = crypto_1.default.fromString(secret);
            yield this.addPublicKey(accountId, secretKeyPair, combinedKey);
        });
    }
    saveKeyPairLocally(accountId, keyPair) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.getKeyStore().setKey(this.networkConfig.networkId, accountId, keyPair);
        });
    }
    addPublicKey(accountId, accessKeyPair, publicKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const memoryKeyStore = new NearApiJs.keyStores.InMemoryKeyStore();
            memoryKeyStore.setKey(this.networkConfig.networkId, accountId, accessKeyPair || NearApiJs.KeyPair.fromRandom('ed25519'));
            const connection = yield NearApiJs.connect(Object.assign(Object.assign({}, this.networkConfig), { keyStore: memoryKeyStore }));
            const account = yield connection.account(accountId);
            yield account.addKey(publicKey);
        });
    }
    getCombinedKey(accountId) {
        return __awaiter(this, void 0, void 0, function* () {
            const keyPair = yield this.getKeyPair(accountId);
            if (!keyPair) {
                throw Error('Cannot create keypair with nullable accountId');
            }
            const response = yield this.confidantService.getCombinedKey(keyPair.getPublicKey().toString());
            return NearApiJs.utils.PublicKey.fromString(response.combinedKey);
        });
    }
    getAccessKey(accountId, publicKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const provider = new NearApiJs.providers.JsonRpcProvider(this.networkConfig.nodeUrl);
            return yield provider.query(`access_key/${accountId}/${publicKey.toString()}`, '');
        });
    }
    multisigSign(transaction, privateKey, combinedPublicKey, auth) {
        return __awaiter(this, void 0, void 0, function* () {
            const step1 = Multisig.multiSignStep1();
            const encodedTransaction = transaction.encode();
            const serializedTxHash = new Uint8Array(js_sha256_1.default.sha256.array(encodedTransaction));
            const step2Data = yield this.confidantService.signTransaction(NearApiJs.utils.serialize.base_encode(serializedTxHash), NearApiJs.utils.serialize.base_encode(step1.data), privateKey.getPublicKey().toString(), auth);
            if (!step2Data.success) {
                console.error(step2Data.reason);
                return null;
            }
            if (!step2Data.data) {
                console.error('Multisig failed');
                return null;
            }
            const signature = Multisig.multiSignStep3(NearApiJs.utils.serialize.base_decode(step2Data.data), step1.secret, serializedTxHash, combinedPublicKey.data, NearApiJs.utils.serialize.base_decode(privateKey.secretKey));
            if (signature === null) {
                return null;
            }
            const nacltest = tweetnacl_1.default.sign.detached.verify(serializedTxHash, signature, combinedPublicKey.data);
            console.log('NaclTest', nacltest);
            const signedTransaction = new NearApiJs.transactions.SignedTransaction({
                transaction,
                signature: new NearApiJs.transactions.Signature({
                    keyType: transaction.publicKey.keyType,
                    data: signature,
                }),
            });
            return signedTransaction;
        });
    }
    sendSignedTransaction(transaction) {
        const signedSerializedTransaction = transaction.encode();
        // sends transaction to NEAR blockchain via JSON RPC call and records the result
        const provider = new NearApiJs.providers.JsonRpcProvider(this.networkConfig.nodeUrl);
        return provider.sendJsonRpc('broadcast_tx_commit', [
            Buffer.from(signedSerializedTransaction).toString('base64'),
        ]);
    }
    getKeyStore() {
        const keyStore = new key_stores_1.BrowserLocalStorageKeyStore(window.localStorage, this.keyPrefix);
        return keyStore;
    }
}
exports.default = Confidant;

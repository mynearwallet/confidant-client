import { KeyPairEd25519 as KeyPairEd25519Lib } from 'near-api-js/lib/utils/key_pair';
/**
 * Wrapper for Ed25519 KeyPairs from NearApiJs
 * cause lib have no generic types
 */
export default class createKeyPairEd25519 {
    static fromString(secretKey: string): KeyPairEd25519Lib;
}

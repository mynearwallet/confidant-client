import * as NearApiJs from 'near-api-js';
import { KeyPairEd25519 as KeyPairEd25519Lib } from 'near-api-js/lib/utils/key_pair';


/**
 * Wrapper for Ed25519 KeyPairs from NearApiJs
 * cause lib have no generic types
 */
export default class createKeyPairEd25519 {
  public static fromString(secretKey: string): KeyPairEd25519Lib {
    return NearApiJs.utils.KeyPairEd25519
        /* eslint-disable max-len */
        /**
         * No generic type
         * @link {https://github.com/near/near-api-js/blob/master/src/utils/key_pair.ts#L85}
         */
        /* eslint-disable max-len */
        .fromString(secretKey) as KeyPairEd25519Lib;
  }
}

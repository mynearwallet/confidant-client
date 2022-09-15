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
Object.defineProperty(exports, "__esModule", { value: true });
const NearApiJs = __importStar(require("near-api-js"));
/**
 * Wrapper for Ed25519 KeyPairs from NearApiJs
 * cause lib have no generic types
 */
class createKeyPairEd25519 {
    static fromString(secretKey) {
        return NearApiJs.utils.KeyPairEd25519
            /* eslint-disable max-len */
            /**
             * No generic type
             * @link {https://github.com/near/near-api-js/blob/master/src/utils/key_pair.ts#L85}
             */
            /* eslint-disable max-len */
            .fromString(secretKey);
    }
}
exports.default = createKeyPairEd25519;
